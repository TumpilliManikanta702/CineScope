import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env';
import { cacheService } from './cache.service';
import { Movie, MovieDetails, Genre, PaginatedResponse } from '../types';
import {
  fallbackTrending,
  fallbackPopular,
  fallbackTopRated,
  fallbackNowPlaying,
  fallbackUpcoming,
  fallbackCatalogMap,
  allCuratedMovies
} from './fallback-catalog.data';

export class MovieService {
  private apiClient: AxiosInstance;
  private hasApiKey: boolean;

  constructor() {
    this.hasApiKey = Boolean(config.TMDB_API_KEY && config.TMDB_API_KEY.length > 5);
    this.apiClient = axios.create({
      baseURL: config.TMDB_BASE_URL,
      timeout: 8000,
      headers: {
        Accept: 'application/json'
      }
    });

    if (this.hasApiKey) {
      console.log('[MovieService] TMDB API Key detected. Live TMDB integration enabled.');
    } else {
      console.log('[MovieService] No TMDB API Key detected. Operating with high-fidelity curated fallback catalog for zero-setup evaluation.');
    }
  }

  // ==========================================
  // VIEWPORT DIVERSITY & DEDUPLICATION HELPERS
  // ==========================================

  /**
   * Enforces zero duplicate movie IDs within any single rail.
   */
  public deduplicateMovies(list: Movie[]): Movie[] {
    const seen = new Set<number>();
    return list.filter(movie => {
      if (!movie || !movie.id) return false;
      if (seen.has(movie.id)) return false;
      seen.add(movie.id);
      return true;
    });
  }

  /**
   * Promotes variety in the initial viewport (first 5-6 cards) without sacrificing
   * category semantic accuracy or blindly discarding movies.
   * If candidate movies already appeared in an earlier rail's top items,
   * category-valid alternatives from slightly further down the list are prioritized
   * for the initial viewport, while overlapping movies remain available later in the rail.
   */
  public applyViewportDiversity(
    candidates: Movie[],
    priorRailIds: Set<number>,
    viewportSize: number = 6
  ): Movie[] {
    if (!priorRailIds || priorRailIds.size === 0 || candidates.length <= viewportSize) {
      return candidates;
    }

    const fresh: Movie[] = [];
    const overlapping: Movie[] = [];

    for (const movie of candidates) {
      if (priorRailIds.has(movie.id)) {
        overlapping.push(movie);
      } else {
        fresh.push(movie);
      }
    }

    // If we have enough fresh category items, fill the initial viewport with fresh items,
    // and append the overlapping items immediately after to preserve natural category crossover.
    if (fresh.length >= viewportSize) {
      return [...fresh.slice(0, viewportSize), ...overlapping, ...fresh.slice(viewportSize)];
    }

    return [...fresh, ...overlapping];
  }

  // ==========================================
  // PUBLIC API METHODS
  // ==========================================

  public async getTrending(timeWindow: 'day' | 'week' = 'week', page: number = 1): Promise<PaginatedResponse<Movie>> {
    const cacheKey = `movies:trending:${timeWindow}:${page}`;
    const cached = cacheService.get<PaginatedResponse<Movie>>(cacheKey);
    if (cached) return cached;

    if (!this.hasApiKey) {
      const result = this.getFallbackPaginated('trending', page);
      // Track top trending IDs so subsequent rails can optimize initial viewport variety
      const topTrendingIds = result.results.slice(0, 8).map(m => m.id);
      cacheService.set('movies:homepage:trending_ids', topTrendingIds, 600);
      cacheService.set(cacheKey, result, 600);
      return result;
    }

    try {
      const response = await this.apiClient.get(`/trending/movie/${timeWindow}`, {
        params: { api_key: config.TMDB_API_KEY, page }
      });
      const normalized = this.normalizePaginatedResponse(response.data);
      normalized.results = this.deduplicateMovies(normalized.results);

      // Track top trending IDs
      const topTrendingIds = normalized.results.slice(0, 8).map(m => m.id);
      cacheService.set('movies:homepage:trending_ids', topTrendingIds, 600);

      cacheService.set(cacheKey, normalized, 600);
      return normalized;
    } catch (err: any) {
      console.warn(`[MovieService] Live trending fetch failed: ${err.message}. Serving fallback.`);
      const fallback = this.getFallbackPaginated('trending', page);
      cacheService.set('movies:homepage:trending_ids', fallback.results.slice(0, 8).map(m => m.id), 600);
      return fallback;
    }
  }

  public async getPopular(page: number = 1): Promise<PaginatedResponse<Movie>> {
    const cacheKey = `movies:popular:${page}`;
    const cached = cacheService.get<PaginatedResponse<Movie>>(cacheKey);
    if (cached) return cached;

    const priorTrendingIds = cacheService.get<number[]>('movies:homepage:trending_ids') || [];
    const trendingSet = new Set(priorTrendingIds);

    if (!this.hasApiKey) {
      const result = this.getFallbackPaginated('popular', page);
      if (trendingSet.size > 0) {
        result.results = this.applyViewportDiversity(result.results, trendingSet, 6);
      }
      cacheService.set(cacheKey, result, 600);
      return result;
    }

    try {
      const response = await this.apiClient.get('/movie/popular', {
        params: { api_key: config.TMDB_API_KEY, page }
      });
      const normalized = this.normalizePaginatedResponse(response.data);
      normalized.results = this.deduplicateMovies(normalized.results);

      // Apply discovery diversity: if top trending titles dominate the first slots,
      // bring popular alternatives forward so the first 5-6 cards are distinct
      if (trendingSet.size > 0) {
        normalized.results = this.applyViewportDiversity(normalized.results, trendingSet, 6);
      }

      cacheService.set(cacheKey, normalized, 600);
      return normalized;
    } catch (err: any) {
      console.warn(`[MovieService] Live popular fetch failed: ${err.message}. Serving fallback.`);
      const fallback = this.getFallbackPaginated('popular', page);
      if (trendingSet.size > 0) {
        fallback.results = this.applyViewportDiversity(fallback.results, trendingSet, 6);
      }
      return fallback;
    }
  }

  public async getTopRated(page: number = 1): Promise<PaginatedResponse<Movie>> {
    const cacheKey = `movies:top_rated:${page}`;
    const cached = cacheService.get<PaginatedResponse<Movie>>(cacheKey);
    if (cached) return cached;

    if (!this.hasApiKey) {
      const result = this.getFallbackPaginated('top_rated', page);
      cacheService.set(cacheKey, result, 600);
      return result;
    }

    try {
      // Use rating-based discovery with a minimum vote count threshold (1000 votes)
      // to ensure acclaimed masterpieces rather than obscure titles with artificially high votes
      const response = await this.apiClient.get('/discover/movie', {
        params: {
          api_key: config.TMDB_API_KEY,
          page,
          sort_by: 'vote_average.desc',
          'vote_count.gte': 1000,
          'vote_average.lte': 10,
          without_genres: '99' // exclude documentaries
        }
      });

      let normalized = this.normalizePaginatedResponse(response.data);
      normalized.results = this.deduplicateMovies(normalized.results);

      // If discover yields few results, fall back to /movie/top_rated
      if (normalized.results.length === 0) {
        const fallbackRes = await this.apiClient.get('/movie/top_rated', {
          params: { api_key: config.TMDB_API_KEY, page }
        });
        normalized = this.normalizePaginatedResponse(fallbackRes.data);
        normalized.results = this.deduplicateMovies(normalized.results);
      }

      cacheService.set(cacheKey, normalized, 600);
      return normalized;
    } catch (err: any) {
      console.warn(`[MovieService] Live top-rated fetch failed: ${err.message}. Serving fallback.`);
      return this.getFallbackPaginated('top_rated', page);
    }
  }

  public async getNowPlaying(page: number = 1): Promise<PaginatedResponse<Movie>> {
    const cacheKey = `movies:now_playing:${page}`;
    const cached = cacheService.get<PaginatedResponse<Movie>>(cacheKey);
    if (cached) return cached;

    if (!this.hasApiKey) {
      const result = this.getFallbackPaginated('now_playing', page);
      cacheService.set(cacheKey, result, 600);
      return result;
    }

    try {
      const response = await this.apiClient.get('/movie/now_playing', {
        params: { api_key: config.TMDB_API_KEY, page }
      });
      const normalized = this.normalizePaginatedResponse(response.data);
      normalized.results = this.deduplicateMovies(normalized.results);

      cacheService.set(cacheKey, normalized, 600);
      return normalized;
    } catch (err: any) {
      console.warn(`[MovieService] Live now-playing fetch failed: ${err.message}. Serving fallback.`);
      return this.getFallbackPaginated('now_playing', page);
    }
  }

  public async getUpcoming(page: number = 1): Promise<PaginatedResponse<Movie>> {
    const cacheKey = `movies:upcoming:${page}`;
    const cached = cacheService.get<PaginatedResponse<Movie>>(cacheKey);
    if (cached) return cached;

    if (!this.hasApiKey) {
      const result = this.getFallbackPaginated('upcoming', page);
      cacheService.set(cacheKey, result, 600);
      return result;
    }

    try {
      const response = await this.apiClient.get('/movie/upcoming', {
        params: { api_key: config.TMDB_API_KEY, page }
      });
      const normalized = this.normalizePaginatedResponse(response.data);
      normalized.results = this.deduplicateMovies(normalized.results);

      cacheService.set(cacheKey, normalized, 600);
      return normalized;
    } catch (err: any) {
      console.warn(`[MovieService] Live upcoming fetch failed: ${err.message}. Serving fallback.`);
      return this.getFallbackPaginated('upcoming', page);
    }
  }

  public async searchMovies(
    query: string,
    page: number = 1,
    filters?: { genreId?: number; year?: number; minRating?: number; language?: string; sortBy?: string }
  ): Promise<PaginatedResponse<Movie>> {
    const cacheKey = `movies:search:${query.toLowerCase().trim()}:${page}:${JSON.stringify(filters || {})}`;
    const cached = cacheService.get<PaginatedResponse<Movie>>(cacheKey);
    if (cached) return cached;

    if (!this.hasApiKey) {
      const result = this.searchFallback(query, page, filters);
      cacheService.set(cacheKey, result, 120);
      return result;
    }

    try {
      let results: Movie[] = [];
      let totalPages = 1;
      let totalResults = 0;

      if (query && query.trim().length > 0) {
        // Query search
        const params: Record<string, any> = {
          api_key: config.TMDB_API_KEY,
          query: query.trim(),
          page,
          include_adult: false
        };
        if (filters?.year) params.primary_release_year = filters.year;

        const response = await this.apiClient.get('/search/movie', { params });
        const normalized = this.normalizePaginatedResponse(response.data);
        results = normalized.results;
        totalPages = normalized.totalPages;
        totalResults = normalized.totalResults;
      } else {
        // Discover with filters
        const params: Record<string, any> = {
          api_key: config.TMDB_API_KEY,
          page,
          include_adult: false
        };
        if (filters?.genreId) params.with_genres = filters.genreId;
        if (filters?.year) params.primary_release_year = filters.year;
        if (filters?.minRating) params['vote_average.gte'] = filters.minRating;
        if (filters?.language) params.with_original_language = filters.language;

        // Sorting mapping
        if (filters?.sortBy) {
          switch (filters.sortBy) {
            case 'rating': params.sort_by = 'vote_average.desc'; break;
            case 'newest': params.sort_by = 'primary_release_date.desc'; break;
            case 'oldest': params.sort_by = 'primary_release_date.asc'; break;
            case 'title': params.sort_by = 'original_title.asc'; break;
            case 'popularity':
            default: params.sort_by = 'popularity.desc'; break;
          }
        }

        const response = await this.apiClient.get('/discover/movie', { params });
        const normalized = this.normalizePaginatedResponse(response.data);
        results = normalized.results;
        totalPages = normalized.totalPages;
        totalResults = normalized.totalResults;
      }

      // Client-side / In-memory filter refinement if TMDB search doesn't support combined params
      if (filters?.genreId && query) {
        results = results.filter(m => m.genreIds.includes(filters.genreId!));
      }
      if (filters?.minRating && query) {
        results = results.filter(m => m.rating >= filters.minRating!);
      }
      if (filters?.language && query) {
        results = results.filter(m => m.originalLanguage === filters.language);
      }

      // Sort results if searched by query
      if (query && filters?.sortBy) {
        results = this.sortMovieList(results, filters.sortBy);
      }

      const paginated: PaginatedResponse<Movie> = {
        page,
        totalPages,
        totalResults,
        results
      };

      cacheService.set(cacheKey, paginated, 120);
      return paginated;
    } catch (err: any) {
      console.warn(`[MovieService] Live search failed: ${err.message}. Serving fallback.`);
      return this.searchFallback(query, page, filters);
    }
  }

  public async getMovieDetails(id: number): Promise<MovieDetails | null> {
    const cacheKey = `movies:details:${id}`;
    const cached = cacheService.get<MovieDetails>(cacheKey);
    if (cached) return cached;

    if (!this.hasApiKey) {
      const fallback = this.getFallbackMovieDetails(id);
      if (fallback) {
        cacheService.set(cacheKey, fallback, 1800);
        return fallback;
      }
      return null;
    }

    try {
      const response = await this.apiClient.get(`/movie/${id}`, {
        params: {
          api_key: config.TMDB_API_KEY,
          append_to_response: 'credits,recommendations,similar'
        }
      });

      const normalized = this.normalizeMovieDetails(response.data);
      cacheService.set(cacheKey, normalized, 1800);
      return normalized;
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        return null;
      }
      console.warn(`[MovieService] Live details fetch failed: ${err.message}. Checking fallback.`);
      return this.getFallbackMovieDetails(id);
    }
  }

  public async getGenres(): Promise<Genre[]> {
    const cacheKey = 'movies:genres';
    const cached = cacheService.get<Genre[]>(cacheKey);
    if (cached) return cached;

    if (!this.hasApiKey) {
      const genres = this.getFallbackGenres();
      cacheService.set(cacheKey, genres, 86400); // 24h
      return genres;
    }

    try {
      const response = await this.apiClient.get('/genre/movie/list', {
        params: { api_key: config.TMDB_API_KEY }
      });
      const genres: Genre[] = response.data.genres || [];
      cacheService.set(cacheKey, genres, 86400);
      return genres;
    } catch (err: any) {
      console.warn(`[MovieService] Live genres fetch failed: ${err.message}. Serving fallback.`);
      return this.getFallbackGenres();
    }
  }

  // ==========================================
  // NORMALIZATION HELPERS
  // ==========================================

  // Standard TMDB Genre ID to Name mapping for list endpoints
  private static readonly GENRE_MAP: Record<number, string> = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Sci-Fi',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
  };

  private normalizeMovie(raw: any): Movie {
    const posterUrl = raw.poster_path ? `${config.TMDB_IMAGE_BASE_URL}/w500${raw.poster_path}` : null;
    const backdropUrl = raw.backdrop_path ? `${config.TMDB_IMAGE_BASE_URL}/w1280${raw.backdrop_path}` : null;
    const releaseDate = raw.release_date || null;
    const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : null;

    const genreIds = raw.genre_ids || (raw.genres ? raw.genres.map((g: any) => g.id) : []);
    let genres: string[] | undefined = undefined;
    if (raw.genres && Array.isArray(raw.genres) && raw.genres.length > 0) {
      genres = raw.genres.map((g: any) => (typeof g === 'string' ? g : g.name));
    } else if (genreIds && genreIds.length > 0) {
      genres = genreIds.map((id: number) => MovieService.GENRE_MAP[id]).filter(Boolean);
    }

    return {
      id: raw.id,
      title: raw.title || raw.name || 'Untitled Movie',
      originalTitle: raw.original_title,
      overview: raw.overview || 'No overview available for this title.',
      posterUrl,
      backdropUrl,
      rating: typeof raw.vote_average === 'number' ? Math.round(raw.vote_average * 10) / 10 : 0,
      voteCount: raw.vote_count || 0,
      releaseDate,
      releaseYear: isNaN(releaseYear as number) ? null : releaseYear,
      genreIds,
      genres,
      popularity: raw.popularity,
      originalLanguage: raw.original_language
    };
  }

  private normalizeMovieDetails(raw: any): MovieDetails {
    const base = this.normalizeMovie(raw);
    const cast = (raw.credits?.cast || []).slice(0, 10).map((c: any) => ({
      id: c.id,
      name: c.name,
      character: c.character || 'Unknown',
      profileUrl: c.profile_path ? `${config.TMDB_IMAGE_BASE_URL}/w185${c.profile_path}` : null
    }));

    const recommendations = (raw.recommendations?.results || raw.similar?.results || [])
      .slice(0, 10)
      .map((m: any) => this.normalizeMovie(m));

    const similar = (raw.similar?.results || [])
      .slice(0, 10)
      .map((m: any) => this.normalizeMovie(m));

    const genreObjects: Genre[] = raw.genres || [];
    const genres: string[] = genreObjects.map(g => g.name);

    return {
      ...base,
      runtime: raw.runtime || null,
      tagline: raw.tagline || null,
      status: raw.status || 'Released',
      genres,
      genreObjects,
      cast,
      recommendations,
      similar
    };
  }

  private normalizePaginatedResponse(raw: any): PaginatedResponse<Movie> {
    const results = (raw.results || []).map((m: any) => this.normalizeMovie(m));
    return {
      page: raw.page || 1,
      totalPages: Math.min(raw.total_pages || 1, 500), // TMDB caps at 500
      totalResults: raw.total_results || results.length,
      results
    };
  }

  private sortMovieList(list: Movie[], sortBy: string): Movie[] {
    const copy = [...list];
    switch (sortBy) {
      case 'rating':
        return copy.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return copy.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
      case 'oldest':
        return copy.sort((a, b) => (a.releaseYear || 0) - (b.releaseYear || 0));
      case 'title':
        return copy.sort((a, b) => a.title.localeCompare(b.title));
      case 'popularity':
      default:
        return copy.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }
  }

  // ==========================================
  // HIGH-FIDELITY FALLBACK CATALOG
  // Ensures CineScope is 100% testable out-of-the-box
  // ==========================================

  private getFallbackGenres(): Genre[] {
    return [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
      { id: 16, name: 'Animation' },
      { id: 35, name: 'Comedy' },
      { id: 80, name: 'Crime' },
      { id: 99, name: 'Documentary' },
      { id: 18, name: 'Drama' },
      { id: 10751, name: 'Family' },
      { id: 14, name: 'Fantasy' },
      { id: 36, name: 'History' },
      { id: 27, name: 'Horror' },
      { id: 10402, name: 'Music' },
      { id: 9648, name: 'Mystery' },
      { id: 10749, name: 'Romance' },
      { id: 878, name: 'Science Fiction' },
      { id: 53, name: 'Thriller' },
      { id: 10752, name: 'War' },
      { id: 37, name: 'Western' }
    ];
  }

  private getFallbackPaginated(category: string, page: number = 1): PaginatedResponse<Movie> {
    let source: MovieDetails[];
    switch (category) {
      case 'trending':
        source = fallbackTrending;
        break;
      case 'popular':
        source = fallbackPopular;
        break;
      case 'top_rated':
        source = fallbackTopRated;
        break;
      case 'now_playing':
        source = fallbackNowPlaying;
        break;
      case 'upcoming':
        source = fallbackUpcoming;
        break;
      default:
        source = allCuratedMovies;
        break;
    }

    const deduplicated = this.deduplicateMovies(source);
    const pageSize = 12;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = deduplicated.slice(startIndex, startIndex + pageSize);

    return {
      page,
      totalPages: Math.max(1, Math.ceil(deduplicated.length / pageSize)),
      totalResults: deduplicated.length,
      results: paginatedItems.map(item => ({
        id: item.id,
        title: item.title,
        originalTitle: item.originalTitle,
        overview: item.overview,
        posterUrl: item.posterUrl,
        backdropUrl: item.backdropUrl,
        rating: item.rating,
        voteCount: item.voteCount,
        releaseDate: item.releaseDate,
        releaseYear: item.releaseYear,
        genreIds: item.genreIds,
        genres: item.genres,
        popularity: item.popularity,
        originalLanguage: item.originalLanguage
      }))
    };
  }

  private searchFallback(query: string, page: number = 1, filters?: any): PaginatedResponse<Movie> {
    let list = Array.from(fallbackCatalogMap.values());

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.overview.toLowerCase().includes(q) ||
        (m.originalTitle && m.originalTitle.toLowerCase().includes(q))
      );
    }

    if (filters?.genreId) {
      list = list.filter(m => m.genreIds.includes(Number(filters.genreId)));
    }
    if (filters?.year) {
      list = list.filter(m => m.releaseYear === Number(filters.year));
    }
    if (filters?.minRating) {
      list = list.filter(m => m.rating >= Number(filters.minRating));
    }
    if (filters?.language) {
      list = list.filter(m => m.originalLanguage === filters.language);
    }

    if (filters?.sortBy) {
      list = this.sortMovieList(list as any, filters.sortBy) as any;
    }

    const deduplicated = this.deduplicateMovies(list);
    const pageSize = 10;
    const startIndex = (page - 1) * pageSize;
    const results = deduplicated.slice(startIndex, startIndex + pageSize);

    return {
      page,
      totalPages: Math.max(1, Math.ceil(deduplicated.length / pageSize)),
      totalResults: deduplicated.length,
      results
    };
  }

  private getFallbackMovieDetails(id: number): MovieDetails | null {
    const movie = fallbackCatalogMap.get(Number(id));
    if (!movie) return null;

    // Curate intelligent recommendations from catalog items
    const primaryGenre = movie.genreIds[0];
    const matchingGenreRecs = Array.from(fallbackCatalogMap.values())
      .filter(m => m.id !== movie.id && m.genreIds.includes(primaryGenre))
      .slice(0, 6);

    const recs = matchingGenreRecs.length >= 4
      ? matchingGenreRecs
      : Array.from(fallbackCatalogMap.values()).filter(m => m.id !== movie.id).slice(0, 6);

    const normalizedRecs = recs.map(r => ({
      id: r.id,
      title: r.title,
      originalTitle: r.originalTitle,
      overview: r.overview,
      posterUrl: r.posterUrl,
      backdropUrl: r.backdropUrl,
      rating: r.rating,
      voteCount: r.voteCount,
      releaseDate: r.releaseDate,
      releaseYear: r.releaseYear,
      genreIds: r.genreIds,
      genres: r.genres,
      popularity: r.popularity,
      originalLanguage: r.originalLanguage
    }));

    return {
      ...movie,
      recommendations: normalizedRecs,
      similar: normalizedRecs
    };
  }
}

export const movieService = new MovieService();

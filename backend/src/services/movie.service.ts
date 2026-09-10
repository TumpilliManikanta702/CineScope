import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env';
import { cacheService } from './cache.service';
import { Movie, MovieDetails, Genre, PaginatedResponse } from '../types';

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
  // PUBLIC API METHODS
  // ==========================================

  public async getTrending(timeWindow: 'day' | 'week' = 'week', page: number = 1): Promise<PaginatedResponse<Movie>> {
    const cacheKey = `movies:trending:${timeWindow}:${page}`;
    const cached = cacheService.get<PaginatedResponse<Movie>>(cacheKey);
    if (cached) return cached;

    if (!this.hasApiKey) {
      const result = this.getFallbackPaginated('trending', page);
      cacheService.set(cacheKey, result, 600);
      return result;
    }

    try {
      const response = await this.apiClient.get(`/trending/movie/${timeWindow}`, {
        params: { api_key: config.TMDB_API_KEY, page }
      });
      const normalized = this.normalizePaginatedResponse(response.data);
      cacheService.set(cacheKey, normalized, 600);
      return normalized;
    } catch (err: any) {
      console.warn(`[MovieService] Live trending fetch failed: ${err.message}. Serving fallback.`);
      return this.getFallbackPaginated('trending', page);
    }
  }

  public async getPopular(page: number = 1): Promise<PaginatedResponse<Movie>> {
    const cacheKey = `movies:popular:${page}`;
    const cached = cacheService.get<PaginatedResponse<Movie>>(cacheKey);
    if (cached) return cached;

    if (!this.hasApiKey) {
      const result = this.getFallbackPaginated('popular', page);
      cacheService.set(cacheKey, result, 600);
      return result;
    }

    try {
      const response = await this.apiClient.get('/movie/popular', {
        params: { api_key: config.TMDB_API_KEY, page }
      });
      const normalized = this.normalizePaginatedResponse(response.data);
      cacheService.set(cacheKey, normalized, 600);
      return normalized;
    } catch (err: any) {
      console.warn(`[MovieService] Live popular fetch failed: ${err.message}. Serving fallback.`);
      return this.getFallbackPaginated('popular', page);
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
      const response = await this.apiClient.get('/movie/top_rated', {
        params: { api_key: config.TMDB_API_KEY, page }
      });
      const normalized = this.normalizePaginatedResponse(response.data);
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

  private normalizeMovie(raw: any): Movie {
    const posterUrl = raw.poster_path ? `${config.TMDB_IMAGE_BASE_URL}/w500${raw.poster_path}` : null;
    const backdropUrl = raw.backdrop_path ? `${config.TMDB_IMAGE_BASE_URL}/w1280${raw.backdrop_path}` : null;
    const releaseDate = raw.release_date || null;
    const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : null;

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
      genreIds: raw.genre_ids || (raw.genres ? raw.genres.map((g: any) => g.id) : []),
      genres: raw.genres ? raw.genres.map((g: any) => g.name) : undefined,
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

  private curatedCatalog: MovieDetails[] = [
    {
      id: 693134,
      title: 'Dune: Part Two',
      originalTitle: 'Dune: Part Two',
      overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s520b4q.jpg',
      rating: 8.4,
      voteCount: 5200,
      releaseDate: '2024-02-27',
      releaseYear: 2024,
      genreIds: [878, 12],
      genres: ['Science Fiction', 'Adventure'],
      genreObjects: [{ id: 878, name: 'Science Fiction' }, { id: 12, name: 'Adventure' }],
      popularity: 380.5,
      originalLanguage: 'en',
      runtime: 166,
      tagline: 'Long live the fighters.',
      status: 'Released',
      cast: [
        { id: 1190668, name: 'Timothée Chalamet', character: 'Paul Atreides', profileUrl: 'https://image.tmdb.org/t/p/w185/BE2sdjpgsa2rNTFa66f7upkaOP.jpg' },
        { id: 505710, name: 'Zendaya', character: 'Chani', profileUrl: 'https://image.tmdb.org/t/p/w185/r3A7evO7aqNVTM5dd7W0U0whCjl.jpg' },
        { id: 933238, name: 'Rebecca Ferguson', character: 'Lady Jessica', profileUrl: 'https://image.tmdb.org/t/p/w185/6NR8eqLhZp1Z0n0c2U7b3s6m1s1.jpg' },
        { id: 1373737, name: 'Austin Butler', character: 'Feyd-Rautha Harkonnen', profileUrl: 'https://image.tmdb.org/t/p/w185/2DzxocT5kL2d0oBq7a1w8z4p9a0.jpg' }
      ],
      recommendations: [],
      similar: []
    },
    {
      id: 872585,
      title: 'Oppenheimer',
      originalTitle: 'Oppenheimer',
      overview: 'The story of J. Robert Oppenheimer\'s role in the development of the atomic bomb during World War II, examining the moral weight of scientific ambition.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/fm6K9vY92yRtupOXF4Athq6rSp1.jpg',
      rating: 8.1,
      voteCount: 9100,
      releaseDate: '2023-07-19',
      releaseYear: 2023,
      genreIds: [18, 36],
      genres: ['Drama', 'History'],
      genreObjects: [{ id: 18, name: 'Drama' }, { id: 36, name: 'History' }],
      popularity: 320.1,
      originalLanguage: 'en',
      runtime: 180,
      tagline: 'The world forever changes.',
      status: 'Released',
      cast: [
        { id: 2037, name: 'Cillian Murphy', character: 'J. Robert Oppenheimer', profileUrl: 'https://image.tmdb.org/t/p/w185/360R371p9zR60tA9w9B3m10v8z9.jpg' },
        { id: 5081, name: 'Emily Blunt', character: 'Katherine Oppenheimer', profileUrl: 'https://image.tmdb.org/t/p/w185/nPJdtVuJNW1gmDpwf34b9z2q0d8.jpg' },
        { id: 3223, name: 'Robert Downey Jr.', character: 'Lewis Strauss', profileUrl: 'https://image.tmdb.org/t/p/w185/5qHNjhtjMD4YWH3vi0lZiq1920z.jpg' }
      ],
      recommendations: [],
      similar: []
    },
    {
      id: 157336,
      title: 'Interstellar',
      originalTitle: 'Interstellar',
      overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
      rating: 8.4,
      voteCount: 35400,
      releaseDate: '2014-11-05',
      releaseYear: 2014,
      genreIds: [12, 18, 878],
      genres: ['Adventure', 'Drama', 'Science Fiction'],
      genreObjects: [{ id: 12, name: 'Adventure' }, { id: 18, name: 'Drama' }, { id: 878, name: 'Science Fiction' }],
      popularity: 290.4,
      originalLanguage: 'en',
      runtime: 169,
      tagline: 'Mankind was born on Earth. It was never meant to die here.',
      status: 'Released',
      cast: [
        { id: 10297, name: 'Matthew McConaughey', character: 'Joseph Cooper', profileUrl: 'https://image.tmdb.org/t/p/w185/eD1d03M2j46a9qGg4u848P2bF7E.jpg' },
        { id: 1813, name: 'Anne Hathaway', character: 'Dr. Amelia Brand', profileUrl: 'https://image.tmdb.org/t/p/w185/7u9h5pXW6lE7qB94t2b6F2yG3G3.jpg' }
      ],
      recommendations: [],
      similar: []
    },
    {
      id: 27205,
      title: 'Inception',
      originalTitle: 'Inception',
      overview: 'Cobb, a skilled thief who steals corporate secrets through dream-sharing technology, is given the inverse task of planting an idea into the mind of a C.E.O.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
      rating: 8.4,
      voteCount: 36200,
      releaseDate: '2010-07-15',
      releaseYear: 2010,
      genreIds: [28, 878, 12],
      genres: ['Action', 'Science Fiction', 'Adventure'],
      genreObjects: [{ id: 28, name: 'Action' }, { id: 878, name: 'Science Fiction' }, { id: 12, name: 'Adventure' }],
      popularity: 260.8,
      originalLanguage: 'en',
      runtime: 148,
      tagline: 'Your mind is the scene of the crime.',
      status: 'Released',
      cast: [
        { id: 6193, name: 'Leonardo DiCaprio', character: 'Dom Cobb', profileUrl: 'https://image.tmdb.org/t/p/w185/wo250aPwfXfF26L7Gq7z2Q09c4v.jpg' },
        { id: 24045, name: 'Joseph Gordon-Levitt', character: 'Arthur', profileUrl: 'https://image.tmdb.org/t/p/w185/4G9zE9g4vK1qK0x4s1.jpg' }
      ],
      recommendations: [],
      similar: []
    },
    {
      id: 155,
      title: 'The Dark Knight',
      originalTitle: 'The Dark Knight',
      overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
      rating: 8.5,
      voteCount: 32500,
      releaseDate: '2008-07-16',
      releaseYear: 2008,
      genreIds: [18, 28, 80, 53],
      genres: ['Drama', 'Action', 'Crime', 'Thriller'],
      genreObjects: [{ id: 18, name: 'Drama' }, { id: 28, name: 'Action' }, { id: 80, name: 'Crime' }],
      popularity: 240.2,
      originalLanguage: 'en',
      runtime: 152,
      tagline: 'Welcome to a world without rules.',
      status: 'Released',
      cast: [
        { id: 3894, name: 'Christian Bale', character: 'Bruce Wayne / Batman', profileUrl: null },
        { id: 1810, name: 'Heath Ledger', character: 'Joker', profileUrl: null }
      ],
      recommendations: [],
      similar: []
    },
    {
      id: 569094,
      title: 'Spider-Man: Across the Spider-Verse',
      originalTitle: 'Spider-Man: Across the Spider-Verse',
      overview: 'After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider-Society.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
      rating: 8.4,
      voteCount: 7100,
      releaseDate: '2023-05-31',
      releaseYear: 2023,
      genreIds: [16, 28, 12, 878],
      genres: ['Animation', 'Action', 'Adventure', 'Science Fiction'],
      genreObjects: [{ id: 16, name: 'Animation' }, { id: 28, name: 'Action' }],
      popularity: 210.0,
      originalLanguage: 'en',
      runtime: 140,
      tagline: 'It\'s how you wear the mask that matters.',
      status: 'Released',
      cast: [
        { id: 587506, name: 'Shameik Moore', character: 'Miles Morales (voice)', profileUrl: null },
        { id: 54693, name: 'Hailee Steinfeld', character: 'Gwen Stacy (voice)', profileUrl: null }
      ],
      recommendations: [],
      similar: []
    },
    {
      id: 335984,
      title: 'Blade Runner 2049',
      originalTitle: 'Blade Runner 2049',
      overview: 'Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what\'s left of society into chaos.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/ilRyAZw0v6aqLw9pgXy2fB11vL7.jpg',
      rating: 8.0,
      voteCount: 13200,
      releaseDate: '2017-10-04',
      releaseYear: 2017,
      genreIds: [878, 18, 9648],
      genres: ['Science Fiction', 'Drama', 'Mystery'],
      genreObjects: [{ id: 878, name: 'Science Fiction' }, { id: 18, name: 'Drama' }],
      popularity: 180.3,
      originalLanguage: 'en',
      runtime: 164,
      tagline: 'There are still pages left in your story.',
      status: 'Released',
      cast: [
        { id: 30614, name: 'Ryan Gosling', character: 'Officer K', profileUrl: null },
        { id: 3, name: 'Harrison Ford', character: 'Rick Deckard', profileUrl: null }
      ],
      recommendations: [],
      similar: []
    },
    {
      id: 496243,
      title: 'Parasite',
      originalTitle: '기생충',
      overview: 'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg',
      rating: 8.5,
      voteCount: 17800,
      releaseDate: '2019-05-30',
      releaseYear: 2019,
      genreIds: [35, 53, 18],
      genres: ['Comedy', 'Thriller', 'Drama'],
      genreObjects: [{ id: 35, name: 'Comedy' }, { id: 53, name: 'Thriller' }, { id: 18, name: 'Drama' }],
      popularity: 195.4,
      originalLanguage: 'ko',
      runtime: 133,
      tagline: 'Act like you own the place.',
      status: 'Released',
      cast: [
        { id: 20738, name: 'Song Kang-ho', character: 'Kim Ki-taek', profileUrl: null },
        { id: 128337, name: 'Lee Sun-kyun', character: 'Park Dong-ik', profileUrl: null }
      ],
      recommendations: [],
      similar: []
    },
    {
      id: 937287,
      title: 'Challengers',
      originalTitle: 'Challengers',
      overview: 'Tennis player-turned-coach Tashi has taken her husband, Art, and transformed him into a world-famous grand slam champion. To shock him out of his recent losing streak, she signs him up for a challenger event.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/H6vke73q3p0v09vGZf4x0b8a2e.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/wNAhuOZ3Zf84jCI58n64h176v6p.jpg',
      rating: 7.2,
      voteCount: 1800,
      releaseDate: '2024-04-18',
      releaseYear: 2024,
      genreIds: [18, 10749],
      genres: ['Drama', 'Romance'],
      genreObjects: [{ id: 18, name: 'Drama' }, { id: 10749, name: 'Romance' }],
      popularity: 160.0,
      originalLanguage: 'en',
      runtime: 131,
      tagline: 'Her game. Her rules.',
      status: 'Released',
      cast: [
        { id: 505710, name: 'Zendaya', character: 'Tashi Duncan', profileUrl: null },
        { id: 1324461, name: 'Josh O\'Connor', character: 'Patrick Zweig', profileUrl: null }
      ],
      recommendations: [],
      similar: []
    },
    {
      id: 129,
      title: 'Spirited Away',
      originalTitle: '千と千尋の神隠し',
      overview: 'A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/Ab8mkHmkYADjU7wQiOkia99GQI.jpg',
      rating: 8.5,
      voteCount: 16300,
      releaseDate: '2001-07-20',
      releaseYear: 2001,
      genreIds: [16, 10751, 14],
      genres: ['Animation', 'Family', 'Fantasy'],
      genreObjects: [{ id: 16, name: 'Animation' }, { id: 10751, name: 'Family' }],
      popularity: 175.2,
      originalLanguage: 'ja',
      runtime: 125,
      tagline: 'The tunnel led Chihiro to a mysterious world...',
      status: 'Released',
      cast: [
        { id: 19588, name: 'Rumi Hiiragi', character: 'Chihiro Ogino (voice)', profileUrl: null }
      ],
      recommendations: [],
      similar: []
    }
  ];

  private getFallbackPaginated(category: string, page: number = 1): PaginatedResponse<Movie> {
    let list = [...this.curatedCatalog];
    if (category === 'top_rated') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (category === 'now_playing' || category === 'upcoming') {
      list.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
    }

    const pageSize = 12;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = list.slice(startIndex, startIndex + pageSize);

    return {
      page,
      totalPages: Math.ceil(list.length / pageSize) || 1,
      totalResults: list.length,
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
    let list = [...this.curatedCatalog];

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

    const pageSize = 10;
    const startIndex = (page - 1) * pageSize;
    const results = list.slice(startIndex, startIndex + pageSize);

    return {
      page,
      totalPages: Math.max(1, Math.ceil(list.length / pageSize)),
      totalResults: list.length,
      results
    };
  }

  private getFallbackMovieDetails(id: number): MovieDetails | null {
    const movie = this.curatedCatalog.find(m => m.id === Number(id));
    if (!movie) return null;

    // Attach recommendations from the other catalog items
    const recs = this.curatedCatalog.filter(m => m.id !== movie.id).slice(0, 6);
    return {
      ...movie,
      recommendations: recs,
      similar: recs
    };
  }
}

export const movieService = new MovieService();

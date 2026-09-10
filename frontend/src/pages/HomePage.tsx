import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { moviesApi } from '../api/movies.api';
import { Movie } from '../types';
import { HeroBanner } from '../components/movie/HeroBanner';
import { MovieRail } from '../components/movie/MovieRail';
import { MovieGrid } from '../components/movie/MovieGrid';
import { HeroBannerSkeleton, MovieRailSkeleton, MovieGridSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';

export const HomePage: React.FC = () => {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [trendingRes, popularRes, topRatedRes, nowPlayingRes, upcomingRes] = await Promise.all([
        moviesApi.getTrending('week', 1),
        moviesApi.getPopular(1),
        moviesApi.getTopRated(1),
        moviesApi.getNowPlaying(1),
        moviesApi.getUpcoming(1)
      ]);

      setTrending(trendingRes.data);
      setPopular(popularRes.data);
      setTopRated(topRatedRes.data);
      setNowPlaying(nowPlayingRes.data);
      setUpcoming(upcomingRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load movie catalog. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  if (error) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <ErrorState
          title="Catalog Temporarily Unavailable"
          message={error}
          onRetry={fetchCatalog}
        />
      </div>
    );
  }

  const featuredMovie = trending.length > 0 ? trending[0] : null;

  return (
    <div className="container" style={{ paddingTop: '1.5rem' }}>
      {/* Hero Section */}
      {loading ? (
        <HeroBannerSkeleton />
      ) : (
        featuredMovie && <HeroBanner movie={featuredMovie} />
      )}

      {/* Trending Now Rail */}
      {loading ? (
        <div style={{ marginBottom: '3rem' }}>
          <div className="skeleton" style={{ width: '200px', height: '1.5rem', marginBottom: '1rem' }} />
          <MovieRailSkeleton count={6} />
        </div>
      ) : (
        trending.length > 0 && (
          <MovieRail
            title="Trending This Week"
            subtitle="The most watched and acclaimed cinema right now"
            movies={trending.slice(1)} // exclude hero movie from duplicate view
            viewAllUrl="/search?sort=popularity"
          />
        )
      )}

      {/* Popular Movies Section */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Popular Worldwide
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Audience favorites across global theaters
            </p>
          </div>
          <Link
            to="/search?sort=popularity"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-accent)'
            }}
          >
            View All
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <MovieGridSkeleton count={8} />
        ) : (
          <MovieGrid movies={popular.slice(0, 10)} />
        )}
      </section>

      {/* Top Rated Rail */}
      {loading ? (
        <div style={{ marginBottom: '3rem' }}>
          <div className="skeleton" style={{ width: '200px', height: '1.5rem', marginBottom: '1rem' }} />
          <MovieRailSkeleton count={6} />
        </div>
      ) : (
        topRated.length > 0 && (
          <MovieRail
            title="Top Rated Masterpieces"
            subtitle="Critically acclaimed cinema rated 8.0 and above"
            movies={topRated}
            viewAllUrl="/search?sort=rating"
          />
        )
      )}

      {/* Now Playing Grid */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Now In Theaters
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Current theatrical releases and premieres
            </p>
          </div>
          <Link
            to="/search?sort=newest"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-accent)'
            }}
          >
            View All
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <MovieGridSkeleton count={8} />
        ) : (
          <MovieGrid movies={nowPlaying.slice(0, 10)} />
        )}
      </section>

      {/* Upcoming Grid */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Coming Soon
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Anticipated upcoming titles scheduled for release
            </p>
          </div>
          <Link
            to="/search?sort=newest"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-accent)'
            }}
          >
            View All
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <MovieGridSkeleton count={8} />
        ) : (
          <MovieGrid movies={upcoming.slice(0, 10)} />
        )}
      </section>
    </div>
  );
};

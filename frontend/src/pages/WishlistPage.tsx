import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Search, Film, Sparkles } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store';
import { MovieCard } from '../components/movie/MovieCard';
import { EmptyState } from '../components/common/EmptyState';
import { openAuthModal } from '../store/slices/uiSlice';
import { Movie } from '../types';

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.wishlist.items);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const [filterQuery, setFilterQuery] = useState('');

  // Map WishlistItem to Movie structure for MovieCard reuse
  const movies: Movie[] = items.map((item) => ({
    id: item.movieId,
    title: item.title,
    overview: item.overview,
    posterUrl: item.posterUrl,
    backdropUrl: item.backdropUrl,
    rating: item.rating,
    voteCount: 0,
    releaseDate: item.releaseDate,
    releaseYear: item.releaseDate ? new Date(item.releaseDate).getFullYear() : null,
    genreIds: []
  }));

  const filteredMovies = filterQuery.trim()
    ? movies.filter((m) => m.title.toLowerCase().includes(filterQuery.toLowerCase()))
    : movies;

  return (
    <div className="container" style={{ paddingTop: '2.5rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--color-accent)' }}>
          <Bookmark size={22} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {isAuthenticated ? 'Cloud Curation (MongoDB Atlas)' : 'Local Curation (Device Storage)'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              My Watchlist
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
              {items.length} {items.length === 1 ? 'title' : 'titles'} saved
              {isAuthenticated && user ? ` to ${user.name}'s library` : ' on this device'}
            </p>
          </div>

          {items.length > 3 && (
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter saved titles..."
                style={{ width: '100%', paddingLeft: '2.4rem', fontSize: '0.85rem' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Guest Mode Banner */}
      {!isAuthenticated && items.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            marginBottom: '2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkles size={18} color="var(--color-accent)" />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Guest Mode Active:</strong> Your curated films are persisted on this device. Sign in or register to sync to MongoDB cloud storage!
            </span>
          </div>
          <button
            onClick={() => dispatch(openAuthModal('register'))}
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--color-accent)',
              padding: '0.4rem 0.95rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-accent)',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              transition: 'all var(--transition-fast)'
            }}
          >
            Sign In / Cloud Sync →
          </button>
        </div>
      )}

      {/* Grid or Empty State */}
      {items.length === 0 ? (
        <EmptyState
          title="Your watchlist is waiting."
          description={
            isAuthenticated
              ? 'Explore trending titles, search your favorite directors, and curate a collection of cinema in your personal cloud account.'
              : 'Tap the heart icon on any movie card to save titles locally. Sign in anytime to persist them to your MongoDB cloud account.'
          }
          icon={<Film size={32} />}
          actionText="Discover Movies"
          onAction={() => navigate('/')}
        />
      ) : filteredMovies.length === 0 ? (
        <EmptyState
          title="No matching saved titles"
          description={`No movies in your watchlist match "${filterQuery}".`}
          actionText="Clear Filter"
          onAction={() => setFilterQuery('')}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

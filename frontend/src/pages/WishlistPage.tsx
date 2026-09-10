import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Search, Film } from 'lucide-react';
import { useAppSelector } from '../store';
import { MovieCard } from '../components/movie/MovieCard';
import { EmptyState } from '../components/common/EmptyState';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { Movie } from '../types';

const WishlistContent: React.FC = () => {
  const navigate = useNavigate();
  const items = useAppSelector((state) => state.wishlist.items);
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
          marginBottom: '2.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--color-accent)' }}>
          <Bookmark size={22} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Personal Curation
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              My Watchlist
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
              {items.length} {items.length === 1 ? 'title' : 'titles'} saved to your personal library
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

      {/* Grid or Empty State */}
      {items.length === 0 ? (
        <EmptyState
          title="Your watchlist is waiting."
          description="Explore trending titles, search your favorite directors, and curate a collection of cinema to experience."
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

export const WishlistPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <WishlistContent />
    </ProtectedRoute>
  );
};

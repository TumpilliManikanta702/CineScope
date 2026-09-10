import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Star } from 'lucide-react';
import { Movie } from '../../types';
import { RatingBadge } from '../common/RatingBadge';
import { WishlistButton } from './WishlistButton';

interface MovieCardProps {
  movie: Movie;
}

const GENRE_NAME_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Doc',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
};

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    navigate(`/movies/${movie.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  const yearDisplay = movie.releaseYear ? movie.releaseYear : 'TBA';
  const primaryGenre =
    (movie.genres && movie.genres.length > 0 && movie.genres[0]) ||
    (movie.genreIds && movie.genreIds.length > 0 && GENRE_NAME_MAP[movie.genreIds[0]]) ||
    null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`${movie.title}, released ${yearDisplay}, rating ${movie.rating}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        width: '100%',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-surface)',
        border: `1px solid ${isHovered ? 'var(--border-hover)' : 'var(--border-subtle)'}`,
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: isHovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        transform: isHovered ? 'translateY(-4px)' : 'none',
        transition: 'transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base)'
      }}
    >
      {/* Poster Container with 2:3 aspect ratio */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '2 / 3',
          backgroundColor: 'var(--bg-subtle)',
          overflow: 'hidden'
        }}
      >
        {movie.posterUrl && !imageError ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            loading="lazy"
            onError={() => setImageError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform var(--transition-smooth)'
            }}
          />
        ) : (
          /* Fallback when poster image is missing or failed to load */
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-muted)',
              padding: '1rem',
              textAlign: 'center'
            }}
          >
            <Film size={36} strokeWidth={1.5} style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              No Poster Available
            </span>
          </div>
        )}

        {/* Top Floating Badge & Wishlist Heart */}
        <div
          style={{
            position: 'absolute',
            top: '0.6rem',
            left: '0.6rem',
            right: '0.6rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 2,
            pointerEvents: 'none'
          }}
        >
          <div style={{ pointerEvents: 'auto' }}>
            <RatingBadge rating={movie.rating} size="sm" />
          </div>
          <div style={{ pointerEvents: 'auto' }}>
            <WishlistButton movie={movie} size="sm" />
          </div>
        </div>

        {/* Hover Quick Synopsis Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(11, 13, 19, 0.95) 0%, rgba(11, 13, 19, 0.7) 50%, transparent 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '1rem',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity var(--transition-base)',
            pointerEvents: 'none'
          }}
        >
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {movie.overview}
          </p>
        </div>
      </div>

      {/* Metadata Bottom Area */}
      <div
        style={{
          padding: '0.75rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        <h3
          title={movie.title}
          style={{
            fontSize: '0.92rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '-0.01em'
          }}
        >
          {movie.title}
        </h3>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)'
          }}
        >
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '72%', color: 'var(--text-muted)' }}>
            <span>{yearDisplay}</span>
            {primaryGenre && (
              <>
                <span aria-hidden="true"> • </span>
                <span>{primaryGenre}</span>
              </>
            )}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              color: 'var(--color-accent)',
              fontWeight: 700,
              fontSize: '0.78rem'
            }}
          >
            <Star size={11} fill="var(--color-accent)" stroke="none" />
            {movie.rating > 0 ? movie.rating.toFixed(1) : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

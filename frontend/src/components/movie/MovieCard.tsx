import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film } from 'lucide-react';
import { Movie } from '../../types';
import { RatingBadge } from '../common/RatingBadge';
import { WishlistButton } from './WishlistButton';

interface MovieCardProps {
  movie: Movie;
}

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
          gap: '0.25rem',
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        <h3
          title={movie.title}
          style={{
            fontSize: '0.92rem',
            fontWeight: 600,
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
            color: 'var(--text-muted)'
          }}
        >
          <span>{yearDisplay}</span>
          {movie.genres && movie.genres.length > 0 && (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: '0.1rem 0.35rem',
                borderRadius: '4px'
              }}
            >
              {movie.genres[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

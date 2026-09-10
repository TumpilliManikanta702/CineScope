import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import { Movie } from '../../types';
import { RatingBadge } from '../common/RatingBadge';
import { WishlistButton } from './WishlistButton';

interface HeroBannerProps {
  movie: Movie;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ movie }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '440px',
        maxHeight: '560px',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        marginBottom: '3rem',
        backgroundColor: 'var(--bg-surface)',
        backgroundImage: 'radial-gradient(ellipse at top right, rgba(245, 158, 11, 0.15), transparent 60%)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'flex-end'
      }}
    >
      {/* High-res Backdrop with Graceful Fallback */}
      {movie.backdropUrl && !imageError && (
        <img
          src={movie.backdropUrl}
          alt={movie.title}
          onError={() => setImageError(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 20%',
            filter: 'brightness(0.7)'
          }}
        />
      )}

      {/* Cinematic Gradient Overlays */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(to right, rgba(11, 13, 19, 0.95) 0%, rgba(11, 13, 19, 0.75) 45%, rgba(11, 13, 19, 0.25) 100%),
            linear-gradient(to top, rgba(11, 13, 19, 1) 0%, rgba(11, 13, 19, 0.6) 40%, transparent 80%)
          `
        }}
      />

      {/* Hero Content & Poster Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '2.5rem 2rem',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '2.25rem'
        }}
      >
        {/* Prominent Movie Poster Card on Tablet & Desktop */}
        {movie.posterUrl && (
          <div
            className="hero-poster-card"
            style={{
              width: '190px',
              minWidth: '190px',
              aspectRatio: '2 / 3',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-medium)',
              backgroundColor: 'var(--bg-surface)',
              flexShrink: 0
            }}
          >
            <img
              src={movie.posterUrl}
              alt={movie.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Hero Metadata Column */}
        <div
          style={{
            maxWidth: '640px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          {/* Badges & Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-accent)',
              backgroundColor: 'var(--color-accent-subtle)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            Featured Premiere
          </span>

          <RatingBadge rating={movie.rating} size="md" />

          {movie.releaseYear && (
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {movie.releaseYear}
            </span>
          )}

          {movie.genres && movie.genres.length > 0 && (
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              • {movie.genres.slice(0, 2).join(', ')}
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            textShadow: '0 2px 10px rgba(0,0,0,0.7)'
          }}
        >
          {movie.title}
        </h1>

        {/* Synopsis */}
        <p
          style={{
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textShadow: '0 1px 4px rgba(0,0,0,0.6)'
          }}
        >
          {movie.overview}
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(`/movies/${movie.id}`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.4rem',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--text-inverse)',
              fontWeight: 700,
              fontSize: '0.92rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-glow)',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
          >
            <Info size={18} />
            View Details
          </button>

          <WishlistButton movie={movie} size="md" showLabel={true} />
        </div>
      </div>
    </div>

    <style>{`
      @media (max-width: 768px) {
        .hero-poster-card {
          display: none !important;
        }
      }
    `}</style>
  </div>
  );
};

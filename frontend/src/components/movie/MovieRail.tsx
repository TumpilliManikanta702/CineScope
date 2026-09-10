import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Movie } from '../../types';
import { MovieCard } from './MovieCard';

interface MovieRailProps {
  title: string;
  movies: Movie[];
  viewAllUrl?: string;
  subtitle?: string;
}

export const MovieRail: React.FC<MovieRailProps> = ({
  title,
  movies,
  viewAllUrl,
  subtitle
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -offset : offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section style={{ marginBottom: '3rem', width: '100%' }}>
      {/* Header with Title and Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '1.25rem'
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em'
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {subtitle}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {viewAllUrl && (
            <Link
              to={viewAllUrl}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--color-accent)',
                transition: 'opacity var(--transition-fast)'
              }}
            >
              View All
              <ArrowRight size={14} />
            </Link>
          )}

          {/* Navigation Arrows */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              onClick={() => handleScroll('left')}
              aria-label={`Scroll ${title} left`}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--color-accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-medium)';
              }}
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={() => handleScroll('right')}
              aria-label={`Scroll ${title} right`}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--color-accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-medium)';
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Rail Container */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '1.25rem',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingBottom: '0.5rem',
          paddingLeft: '2px',
          paddingRight: '2px'
        }}
      >
        {movies.map((movie) => (
          <div
            key={movie.id}
            style={{
              width: '190px',
              minWidth: '190px',
              flexShrink: 0,
              scrollSnapAlign: 'start'
            }}
          >
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </section>
  );
};

import React from 'react';

export const MovieCardSkeleton: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        width: '100%'
      }}
    >
      {/* Poster shimmer with 2:3 aspect ratio */}
      <div
        className="skeleton"
        style={{
          width: '100%',
          aspectRatio: '2 / 3',
          borderRadius: 'var(--radius-md)'
        }}
      />
      {/* Title shimmer */}
      <div
        className="skeleton"
        style={{
          width: '80%',
          height: '1rem',
          borderRadius: '4px'
        }}
      />
      {/* Metadata shimmer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div
          className="skeleton"
          style={{
            width: '30%',
            height: '0.85rem',
            borderRadius: '4px'
          }}
        />
        <div
          className="skeleton"
          style={{
            width: '25%',
            height: '1.2rem',
            borderRadius: 'var(--radius-sm)'
          }}
        />
      </div>
    </div>
  );
};

export const MovieGridSkeleton: React.FC<{ count?: number }> = ({ count = 12 }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '1.5rem',
        width: '100%'
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const MovieRailSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '1.25rem',
        overflow: 'hidden',
        width: '100%',
        paddingBottom: '0.5rem'
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ width: '200px', flexShrink: 0 }}>
          <MovieCardSkeleton />
        </div>
      ))}
    </div>
  );
};

export const HeroBannerSkeleton: React.FC = () => {
  return (
    <div
      className="hero-banner-card skeleton"
      style={{
        width: '100%',
        minHeight: '480px',
        maxHeight: '580px'
      }}
    />
  );
};

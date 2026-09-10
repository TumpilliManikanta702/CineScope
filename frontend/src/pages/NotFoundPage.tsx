import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        textAlign: 'center',
        padding: '3rem 1.5rem'
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          color: 'var(--color-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}
      >
        <Compass size={36} />
      </div>

      <div
        style={{
          fontSize: '4rem',
          fontWeight: 900,
          fontFamily: 'var(--font-display)',
          color: 'var(--color-accent)',
          lineHeight: 1,
          marginBottom: '0.5rem'
        }}
      >
        404
      </div>

      <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.75rem' }}>
        Scene Not Found
      </h1>

      <p style={{ maxWidth: '460px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
        The reel you are searching for does not exist, has been re-edited, or moved to another vault.
      </p>

      <button
        onClick={() => navigate('/')}
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
          boxShadow: 'var(--shadow-glow)'
        }}
      >
        <Home size={18} />
        Return to Home
      </button>
    </div>
  );
};

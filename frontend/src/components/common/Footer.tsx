import React from 'react';
import { Film } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-subtle)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '3.5rem 0 2rem',
        marginTop: 'auto'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem'
          }}
        >
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-inverse)'
                }}
              >
                <Film size={18} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>
                Cine<span style={{ color: 'var(--color-accent)' }}>Scope</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '320px' }}>
              The modern, editorial movie discovery experience. Designed and engineered for high performance, deep exploration, and persistent curation.
            </p>
          </div>

          {/* Navigation Col */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Explore
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li>
                <Link to="/" style={{ transition: 'color var(--transition-fast)' }}>
                  Home & Discover
                </Link>
              </li>
              <li>
                <Link to="/search" style={{ transition: 'color var(--transition-fast)' }}>
                  Advanced Movie Search
                </Link>
              </li>
              <li>
                <Link to="/wishlist" style={{ transition: 'color var(--transition-fast)' }}>
                  Personal Watchlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Technical Col */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Architecture
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Built with React 19, TypeScript, Redux Toolkit, Node.js, Express, and MongoDB. Features TMDB service abstraction, in-memory TTL caching, optimistic UI updates, and URL-synchronized state.
            </p>
          </div>
        </div>

        {/* Bottom Disclaimers */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>
            © {new Date().getFullYear()} CineScope. Built for Trackzio Screening Assignment.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Powered by the TMDB API. This product uses the TMDB API but is not endorsed or certified by TMDB.
          </div>
        </div>
      </div>
    </footer>
  );
};

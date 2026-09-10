import React from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { openAuthModal } from '../../store/slices/uiSlice';
import { Bookmark, LogIn } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <div
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: '60vh',
          padding: '4rem 1.5rem'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-accent)',
            marginBottom: '1.5rem'
          }}
        >
          <Bookmark size={30} />
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Sign In to Access Your Wishlist
        </h2>

        <p style={{ maxWidth: '420px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
          Your watchlist is saved securely across sessions. Sign in to view and manage your curated films.
        </p>

        <button
          onClick={() => dispatch(openAuthModal('login'))}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--color-accent)',
            color: 'var(--text-inverse)',
            fontWeight: 700,
            fontSize: '0.95rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-glow)',
            transition: 'background-color var(--transition-fast)'
          }}
        >
          <LogIn size={18} />
          Sign In / Create Account
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

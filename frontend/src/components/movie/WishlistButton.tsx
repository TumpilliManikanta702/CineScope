import React from 'react';
import { Heart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
import { openAuthModal, addToast } from '../../store/slices/uiSlice';
import { Movie } from '../../types';

interface WishlistButtonProps {
  movie: Movie;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  movie,
  size = 'md',
  showLabel = false
}) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const movieIds = useAppSelector((state) => state.wishlist.movieIds);
  const isSaved = movieIds.includes(movie.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      dispatch(addToast({ message: 'Please log in to save movies to your wishlist', type: 'info' }));
      dispatch(openAuthModal('login'));
      return;
    }

    dispatch(toggleWishlist(movie));
  };

  const iconSizes = { sm: 16, md: 20, lg: 24 }[size];

  return (
    <button
      onClick={handleClick}
      aria-label={isSaved ? `Remove ${movie.title} from wishlist` : `Add ${movie.title} to wishlist`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: showLabel ? '0.6rem 1.1rem' : '0.5rem',
        backgroundColor: isSaved
          ? 'rgba(244, 63, 94, 0.15)'
          : 'rgba(11, 13, 19, 0.65)',
        color: isSaved ? 'var(--color-danger)' : 'var(--text-secondary)',
        border: `1px solid ${isSaved ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-subtle)'}`,
        borderRadius: showLabel ? 'var(--radius-md)' : '50%',
        backdropFilter: 'blur(8px)',
        transition: 'all var(--transition-fast)',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        if (!isSaved) {
          e.currentTarget.style.color = 'var(--color-danger)';
          e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.3)';
          e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSaved) {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.backgroundColor = 'rgba(11, 13, 19, 0.65)';
        }
      }}
    >
      <Heart
        size={iconSizes}
        fill={isSaved ? 'var(--color-danger)' : 'none'}
        stroke={isSaved ? 'var(--color-danger)' : 'currentColor'}
        strokeWidth={2}
      />
      {showLabel && (
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {isSaved ? 'In Watchlist' : 'Add to Watchlist'}
        </span>
      )}
    </button>
  );
};

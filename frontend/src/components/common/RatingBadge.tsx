import React from 'react';
import { Star } from 'lucide-react';

interface RatingBadgeProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showStar?: boolean;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  rating,
  size = 'md',
  showStar = true
}) => {
  const formatted = rating > 0 ? rating.toFixed(1) : 'N/A';

  // Color coding
  let badgeColor = 'var(--text-muted)';
  let bgGradient = 'rgba(100, 116, 139, 0.15)';
  let borderColor = 'rgba(100, 116, 139, 0.3)';

  if (rating >= 7.5) {
    badgeColor = 'var(--color-success)';
    bgGradient = 'rgba(16, 185, 129, 0.15)';
    borderColor = 'rgba(16, 185, 129, 0.35)';
  } else if (rating >= 6.0) {
    badgeColor = 'var(--color-accent)';
    bgGradient = 'rgba(245, 158, 11, 0.15)';
    borderColor = 'rgba(245, 158, 11, 0.35)';
  } else if (rating > 0) {
    badgeColor = '#94A3B8';
    bgGradient = 'rgba(148, 163, 184, 0.15)';
    borderColor = 'rgba(148, 163, 184, 0.3)';
  }

  const sizeStyles = {
    sm: { padding: '0.15rem 0.4rem', fontSize: '0.75rem', iconSize: 11 },
    md: { padding: '0.25rem 0.55rem', fontSize: '0.85rem', iconSize: 13 },
    lg: { padding: '0.4rem 0.75rem', fontSize: '1rem', iconSize: 16 }
  }[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: sizeStyles.padding,
        fontSize: sizeStyles.fontSize,
        fontWeight: 600,
        color: badgeColor,
        backgroundColor: bgGradient,
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius-sm)',
        backdropFilter: 'blur(8px)',
        letterSpacing: '0.02em',
        fontVariantNumeric: 'tabular-nums'
      }}
      aria-label={`Rating: ${formatted} out of 10`}
    >
      {showStar && <Star size={sizeStyles.iconSize} fill={badgeColor} stroke="none" />}
      {formatted}
    </span>
  );
};

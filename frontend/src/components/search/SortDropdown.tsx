import React from 'react';
import { ArrowUpDown } from 'lucide-react';

interface SortDropdownProps {
  value?: string;
  onChange: (sort: string) => void;
}

export const SORT_OPTIONS = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Release Date (Newest)' },
  { value: 'oldest', label: 'Release Date (Oldest)' },
  { value: 'title', label: 'Title (A-Z)' }
];

export const SortDropdown: React.FC<SortDropdownProps> = ({
  value = 'popularity',
  onChange
}) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-md)',
        padding: '0.4rem 0.75rem',
        color: 'var(--text-secondary)'
      }}
    >
      <ArrowUpDown size={15} color="var(--color-accent)" />
      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Sort:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Sort movies by"
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          padding: '0.2rem',
          outline: 'none'
        }}
      >
        {SORT_OPTIONS.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

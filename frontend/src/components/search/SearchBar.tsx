import React, { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialValue = '',
  onSearch,
  isLoading = false,
  placeholder = 'Search by title, director, keywords...'
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedTerm = useDebounce(searchTerm, 400);

  // Sync external changes (e.g. from URL changes or clear button)
  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  // Trigger search when debounced value changes
  useEffect(() => {
    onSearch(debouncedTerm);
  }, [debouncedTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '720px'
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none'
        }}
      >
        <Search size={20} />
      </div>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        aria-label="Search movies"
        style={{
          width: '100%',
          padding: '0.875rem 3rem 0.875rem 3rem',
          fontSize: '1rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all var(--transition-fast)'
        }}
      />

      <div
        style={{
          position: 'absolute',
          right: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        {isLoading && (
          <Loader2
            size={18}
            className="animate-spin"
            style={{
              color: 'var(--color-accent)',
              animation: 'spin 1s linear infinite'
            }}
          />
        )}

        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '0.2rem',
              borderRadius: '50%',
              transition: 'color var(--transition-fast)'
            }}
            aria-label="Clear search input"
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';
import { SearchFilters, Genre } from '../../types';
import { moviesApi } from '../../api/movies.api';

interface FilterBarProps {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  onClear: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onClear
}) => {
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    let mounted = true;
    moviesApi.getGenres().then((data) => {
      if (mounted) setGenres(data);
    }).catch(() => {
      // Handled gracefully by fallback
    });
    return () => {
      mounted = false;
    };
  }, []);

  const years = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2015, 2010, 2000, 1990];
  const ratings = [
    { label: '8.0+ Exceptional', value: '8' },
    { label: '7.0+ Great', value: '7' },
    { label: '6.0+ Good', value: '6' },
    { label: '5.0+ Average', value: '5' }
  ];
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ja', label: 'Japanese' },
    { code: 'ko', label: 'Korean' },
    { code: 'fr', label: 'French' },
    { code: 'es', label: 'Spanish' },
    { code: 'de', label: 'German' },
    { code: 'it', label: 'Italian' },
    { code: 'hi', label: 'Hindi' }
  ];

  const hasActiveFilters = Boolean(
    filters.genre || filters.year || filters.rating || filters.language
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        width: '100%',
        backgroundColor: 'var(--bg-subtle)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem'
      }}
    >
      {/* Controls Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
          <Filter size={16} color="var(--color-accent)" />
          <span>Filters:</span>
        </div>

        {/* Genre Selector */}
        <select
          value={filters.genre || ''}
          onChange={(e) => onFilterChange({ genre: e.target.value || undefined, page: 1 })}
          aria-label="Filter by genre"
          style={{
            backgroundColor: 'var(--bg-surface)',
            color: filters.genre ? 'var(--color-accent)' : 'var(--text-secondary)',
            borderColor: filters.genre ? 'var(--color-accent)' : 'var(--border-medium)',
            padding: '0.45rem 0.75rem',
            fontSize: '0.85rem',
            fontWeight: 500,
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer'
          }}
        >
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        {/* Year Selector */}
        <select
          value={filters.year || ''}
          onChange={(e) => onFilterChange({ year: e.target.value || undefined, page: 1 })}
          aria-label="Filter by release year"
          style={{
            backgroundColor: 'var(--bg-surface)',
            color: filters.year ? 'var(--color-accent)' : 'var(--text-secondary)',
            borderColor: filters.year ? 'var(--color-accent)' : 'var(--border-medium)',
            padding: '0.45rem 0.75rem',
            fontSize: '0.85rem',
            fontWeight: 500,
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer'
          }}
        >
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {/* Min Rating Selector */}
        <select
          value={filters.rating || ''}
          onChange={(e) => onFilterChange({ rating: e.target.value || undefined, page: 1 })}
          aria-label="Filter by minimum rating"
          style={{
            backgroundColor: 'var(--bg-surface)',
            color: filters.rating ? 'var(--color-accent)' : 'var(--text-secondary)',
            borderColor: filters.rating ? 'var(--color-accent)' : 'var(--border-medium)',
            padding: '0.45rem 0.75rem',
            fontSize: '0.85rem',
            fontWeight: 500,
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer'
          }}
        >
          <option value="">Any Rating</option>
          {ratings.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        {/* Language Selector */}
        <select
          value={filters.language || ''}
          onChange={(e) => onFilterChange({ language: e.target.value || undefined, page: 1 })}
          aria-label="Filter by language"
          style={{
            backgroundColor: 'var(--bg-surface)',
            color: filters.language ? 'var(--color-accent)' : 'var(--text-secondary)',
            borderColor: filters.language ? 'var(--color-accent)' : 'var(--border-medium)',
            padding: '0.45rem 0.75rem',
            fontSize: '0.85rem',
            fontWeight: 500,
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer'
          }}
        >
          <option value="">All Languages</option>
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>

        {/* Clear All Button */}
        {hasActiveFilters && (
          <button
            onClick={onClear}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-medium)',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-danger)';
              e.currentTarget.style.borderColor = 'var(--color-danger)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'var(--border-medium)';
            }}
          >
            <RotateCcw size={13} />
            Reset Filters
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active:
          </span>

          {filters.genre && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                backgroundColor: 'var(--color-accent-subtle)',
                color: 'var(--color-accent)',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              Genre: {genres.find(g => String(g.id) === String(filters.genre))?.name || filters.genre}
              <button
                onClick={() => onFilterChange({ genre: undefined, page: 1 })}
                aria-label="Remove genre filter"
                style={{ display: 'flex' }}
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.year && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                backgroundColor: 'var(--color-accent-subtle)',
                color: 'var(--color-accent)',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              Year: {filters.year}
              <button
                onClick={() => onFilterChange({ year: undefined, page: 1 })}
                aria-label="Remove year filter"
                style={{ display: 'flex' }}
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.rating && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                backgroundColor: 'var(--color-accent-subtle)',
                color: 'var(--color-accent)',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              Rating: {filters.rating}+
              <button
                onClick={() => onFilterChange({ rating: undefined, page: 1 })}
                aria-label="Remove rating filter"
                style={{ display: 'flex' }}
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.language && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                backgroundColor: 'var(--color-accent-subtle)',
                color: 'var(--color-accent)',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              Lang: {languages.find(l => l.code === filters.language)?.label || filters.language}
              <button
                onClick={() => onFilterChange({ language: undefined, page: 1 })}
                aria-label="Remove language filter"
                style={{ display: 'flex' }}
              >
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

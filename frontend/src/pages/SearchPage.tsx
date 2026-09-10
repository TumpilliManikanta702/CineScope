import React, { useEffect, useState, useRef } from 'react';
import { useUrlState } from '../hooks/useUrlState';
import { moviesApi } from '../api/movies.api';
import { Movie } from '../types';
import { SearchBar } from '../components/search/SearchBar';
import { FilterBar } from '../components/search/FilterBar';
import { SortDropdown } from '../components/search/SortDropdown';
import { Pagination } from '../components/search/Pagination';
import { MovieGrid } from '../components/movie/MovieGrid';
import { MovieGridSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

export const SearchPage: React.FC = () => {
  const { filters, updateFilters, clearFilters } = useUrlState();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Abort controller ref to cancel stale out-of-order responses
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel previous inflight search request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    moviesApi
      .searchMovies(filters, controller.signal)
      .then((res) => {
        setMovies(res.data);
        setTotalResults(res.meta.totalResults);
        setTotalPages(res.meta.totalPages);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          // Request was aborted due to rapid new search; ignore silently
          return;
        }
        setError(err.message || 'Unable to fetch search results');
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [filters]);

  const handleQueryChange = (query: string) => {
    if (query !== filters.q) {
      updateFilters({ q: query, page: 1 });
    }
  };

  const handleSortChange = (sort: string) => {
    updateFilters({ sort, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      {/* Header & Search Bar Area */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em'
          }}
        >
          Explore Cinema
        </h1>
        <p style={{ maxWidth: '540px', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
          Search across thousands of titles, filter by genre, era, or rating, and curate your personal film collection.
        </p>

        <SearchBar
          initialValue={filters.q}
          onSearch={handleQueryChange}
          isLoading={loading}
          placeholder="Search by title, director, keyword..."
        />
      </div>

      {/* Filter and Sort Toolbar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <FilterBar
          filters={filters}
          onFilterChange={updateFilters}
          onClear={clearFilters}
        />

        {/* Results Info & Sort Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {loading ? (
              <span>Searching titles...</span>
            ) : (
              <span>
                Found <strong style={{ color: 'var(--text-primary)' }}>{totalResults}</strong> movies
                {filters.q ? ` matching "${filters.q}"` : ''}
              </span>
            )}
          </div>

          <SortDropdown value={filters.sort} onChange={handleSortChange} />
        </div>
      </div>

      {/* Results State Rendering */}
      {error ? (
        <ErrorState
          title="Search Failed"
          message={error}
          onRetry={() => updateFilters({ page: 1 })}
        />
      ) : loading ? (
        <MovieGridSkeleton count={12} />
      ) : movies.length === 0 ? (
        <EmptyState
          title="No movies found"
          description="We couldn't find any movies matching your current filters and query. Try clearing filters or using different keywords."
          actionText="Reset All Filters"
          onAction={clearFilters}
        />
      ) : (
        <>
          <MovieGrid movies={movies} />
          <Pagination
            currentPage={filters.page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

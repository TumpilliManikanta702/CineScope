import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import { SearchFilters } from '../types';

export function useUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: SearchFilters = useMemo(() => {
    return {
      q: searchParams.get('q') || '',
      genre: searchParams.get('genre') || undefined,
      year: searchParams.get('year') || undefined,
      rating: searchParams.get('rating') || undefined,
      language: searchParams.get('language') || undefined,
      sort: searchParams.get('sort') || 'popularity',
      page: parseInt(searchParams.get('page') || '1', 10)
    };
  }, [searchParams]);

  const updateFilters = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        Object.entries(newFilters).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '' || (key === 'page' && value === 1)) {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
        });

        return next;
      });
    },
    [setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      // Preserve search query if present, reset filters and page
      const currentQ = prev.get('q');
      if (currentQ) {
        next.set('q', currentQ);
      }
      return next;
    });
  }, [setSearchParams]);

  return {
    filters,
    updateFilters,
    clearFilters
  };
}

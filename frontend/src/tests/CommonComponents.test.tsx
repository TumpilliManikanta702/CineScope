import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { SearchBar } from '../components/search/SearchBar';

describe('Common UX Components', () => {
  it('EmptyState renders title, description, and triggers CTA action', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="Your watchlist is waiting."
        description="Explore movies to add titles."
        actionText="Discover Movies"
        onAction={handleAction}
      />
    );

    expect(screen.getByText('Your watchlist is waiting.')).toBeInTheDocument();
    expect(screen.getByText('Explore movies to add titles.')).toBeInTheDocument();

    const actionBtn = screen.getByRole('button', { name: /discover movies/i });
    expect(actionBtn).toBeInTheDocument();
    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('ErrorState renders error message and triggers retry action', () => {
    const handleRetry = vi.fn();
    render(
      <ErrorState
        title="Catalog Temporarily Unavailable"
        message="Please check connection"
        onRetry={handleRetry}
      />
    );

    expect(screen.getByText('Catalog Temporarily Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Please check connection')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('SearchBar triggers onSearch after debounce delay', async () => {
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} placeholder="Search movies..." />);

    const input = screen.getByPlaceholderText('Search movies...');
    fireEvent.change(input, { target: { value: 'Interstellar' } });

    await waitFor(
      () => {
        expect(handleSearch).toHaveBeenCalledWith('Interstellar');
      },
      { timeout: 1000 }
    );
  });
});

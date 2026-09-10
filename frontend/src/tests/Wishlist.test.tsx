import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from '../store';
import { WishlistButton } from '../components/movie/WishlistButton';
import { WishlistPage } from '../pages/WishlistPage';
import { Movie } from '../types';
import { clearWishlist } from '../store/slices/wishlistSlice';

const sampleMovie: Movie = {
  id: 157336,
  title: 'Interstellar',
  overview: 'A team of explorers travel through a wormhole in space...',
  posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
  backdropUrl: 'https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
  rating: 8.7,
  voteCount: 35000,
  releaseDate: '2014-11-05',
  releaseYear: 2014,
  genreIds: [878, 18],
  genres: ['Science Fiction', 'Drama']
};

describe('Guest Wishlist Persistence & UI', () => {
  beforeEach(() => {
    localStorage.clear();
    store.dispatch(clearWishlist());
  });

  it('allows a guest user to save a title to wishlist without mandatory login', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <WishlistButton movie={sampleMovie} showLabel={true} />
        </MemoryRouter>
      </Provider>
    );

    const btn = screen.getByRole('button', { name: /add interstellar to wishlist/i });
    expect(btn).toBeInTheDocument();

    // Click to add
    fireEvent.click(btn);

    // Verify localStorage was updated
    const saved = JSON.parse(localStorage.getItem('cinescope_guest_wishlist') || '[]');
    expect(saved.length).toBe(1);
    expect(saved[0].movieId).toBe(157336);
    expect(saved[0].title).toBe('Interstellar');
  });

  it('allows a guest user to toggle and remove a saved title from wishlist', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <WishlistButton movie={sampleMovie} showLabel={true} />
        </MemoryRouter>
      </Provider>
    );

    // Add
    const btn = screen.getByRole('button');
    fireEvent.click(btn);

    // Remove
    fireEvent.click(btn);

    const savedAfter = JSON.parse(localStorage.getItem('cinescope_guest_wishlist') || '[]');
    expect(savedAfter.length).toBe(0);
  });

  it('WishlistPage displays the guest curation banner and saved titles', () => {
    // Save sample movie first
    render(
      <Provider store={store}>
        <MemoryRouter>
          <WishlistButton movie={sampleMovie} />
        </MemoryRouter>
      </Provider>
    );
    fireEvent.click(screen.getByRole('button'));

    // Render WishlistPage
    render(
      <Provider store={store}>
        <MemoryRouter>
          <WishlistPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/Guest Mode Active:/i)).toBeInTheDocument();
    expect(screen.getByText('Interstellar')).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from '../store';
import { MovieCard } from '../components/movie/MovieCard';
import { Movie } from '../types';

const mockMovie: Movie = {
  id: 693134,
  title: 'Dune: Part Two',
  overview: 'Follow the mythic journey of Paul Atreides...',
  posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
  backdropUrl: null,
  rating: 8.4,
  voteCount: 5200,
  releaseDate: '2024-02-27',
  releaseYear: 2024,
  genreIds: [878, 12],
  genres: ['Science Fiction']
};

describe('MovieCard Component', () => {
  it('renders movie title, release year, and rating badge', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <MovieCard movie={mockMovie} />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Dune: Part Two')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('8.4')).toBeInTheDocument();
    expect(screen.getByText('Science Fiction')).toBeInTheDocument();
  });

  it('renders fallback UI when poster is null', () => {
    const movieWithoutPoster: Movie = {
      ...mockMovie,
      posterUrl: null
    };

    render(
      <Provider store={store}>
        <MemoryRouter>
          <MovieCard movie={movieWithoutPoster} />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('No Poster Available')).toBeInTheDocument();
  });

  it('has accessible wishlist toggle button with aria-label', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <MovieCard movie={mockMovie} />
        </MemoryRouter>
      </Provider>
    );

    const wishlistBtn = screen.getByRole('button', { name: /add dune: part two to wishlist/i });
    expect(wishlistBtn).toBeInTheDocument();
  });
});

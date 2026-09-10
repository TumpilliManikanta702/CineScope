import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WishlistItem, Movie } from '../../types';
import { wishlistApi } from '../../api/wishlist.api';
import { addToast } from './uiSlice';

interface WishlistState {
  items: WishlistItem[];
  movieIds: number[];
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  movieIds: [],
  loading: false,
  error: null
};

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const items = await wishlistApi.getWishlist();
      return items;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch wishlist');
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggle',
  async (movie: Movie, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as any;
    const isSaved = state.wishlist.movieIds.includes(movie.id);

    // Optimistically update local state immediately
    if (isSaved) {
      dispatch(wishlistSlice.actions.optimisticRemove(movie.id));
    } else {
      const optimisticItem: WishlistItem = {
        id: 'temp_' + movie.id,
        movieId: movie.id,
        title: movie.title,
        posterUrl: movie.posterUrl,
        backdropUrl: movie.backdropUrl,
        overview: movie.overview,
        rating: movie.rating,
        releaseDate: movie.releaseDate,
        createdAt: new Date().toISOString()
      };
      dispatch(wishlistSlice.actions.optimisticAdd(optimisticItem));
    }

    try {
      if (isSaved) {
        await wishlistApi.removeFromWishlist(movie.id);
        dispatch(addToast({ message: `"${movie.title}" removed from your wishlist`, type: 'info' }));
        return { movieId: movie.id, action: 'removed' as const };
      } else {
        const added = await wishlistApi.addToWishlist(movie);
        dispatch(addToast({ message: `"${movie.title}" added to your wishlist`, type: 'success' }));
        return { item: added, action: 'added' as const };
      }
    } catch (err: any) {
      // Revert optimistic update on failure
      dispatch(wishlistSlice.actions.rollback({ movie, wasSaved: isSaved }));
      dispatch(addToast({ message: err.message || 'Could not update wishlist', type: 'error' }));
      return rejectWithValue(err.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    optimisticAdd: (state, action: PayloadAction<WishlistItem>) => {
      if (!state.movieIds.includes(action.payload.movieId)) {
        state.items.unshift(action.payload);
        state.movieIds.push(action.payload.movieId);
      }
    },
    optimisticRemove: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.movieId !== action.payload);
      state.movieIds = state.movieIds.filter(id => id !== action.payload);
    },
    rollback: (state, action: PayloadAction<{ movie: Movie; wasSaved: boolean }>) => {
      const { movie, wasSaved } = action.payload;
      if (wasSaved) {
        // Was saved before, but we tried to remove and failed -> re-add
        if (!state.movieIds.includes(movie.id)) {
          state.items.unshift({
            id: 'temp_' + movie.id,
            movieId: movie.id,
            title: movie.title,
            posterUrl: movie.posterUrl,
            backdropUrl: movie.backdropUrl,
            overview: movie.overview,
            rating: movie.rating,
            releaseDate: movie.releaseDate,
            createdAt: new Date().toISOString()
          });
          state.movieIds.push(movie.id);
        }
      } else {
        // Was not saved before, but we tried to add and failed -> remove
        state.items = state.items.filter(item => item.movieId !== movie.id);
        state.movieIds = state.movieIds.filter(id => id !== movie.id);
      }
    },
    clearWishlist: (state) => {
      state.items = [];
      state.movieIds = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWishlist.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchWishlist.fulfilled, (state, action: PayloadAction<WishlistItem[]>) => {
      state.loading = false;
      state.items = action.payload;
      state.movieIds = action.payload.map(item => item.movieId);
    });
    builder.addCase(fetchWishlist.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(toggleWishlist.fulfilled, (state, action) => {
      if (action.payload.action === 'added' && action.payload.item) {
        // Replace temp item with real saved entity
        const idx = state.items.findIndex(i => i.movieId === action.payload.item!.movieId);
        if (idx !== -1) {
          state.items[idx] = action.payload.item;
        }
      }
    });
  }
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

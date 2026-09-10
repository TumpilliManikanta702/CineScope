import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WishlistItem, Movie } from '../../types';
import { wishlistApi } from '../../api/wishlist.api';
import { addToast } from './uiSlice';

const GUEST_STORAGE_KEY = 'cinescope_guest_wishlist';

function loadGuestWishlist(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGuestWishlist(items: WishlistItem[]) {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota errors
  }
}

interface WishlistState {
  items: WishlistItem[];
  movieIds: number[];
  loading: boolean;
  error: string | null;
}

const initialGuestItems = loadGuestWishlist();

const initialState: WishlistState = {
  items: initialGuestItems,
  movieIds: initialGuestItems.map(item => item.movieId),
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

export const syncGuestWishlist = createAsyncThunk(
  'wishlist/syncGuest',
  async (_, { dispatch }) => {
    const guestItems = loadGuestWishlist();
    if (guestItems.length === 0) return;

    let syncedCount = 0;
    for (const item of guestItems) {
      try {
        await wishlistApi.addToWishlist({
          id: item.movieId,
          title: item.title,
          posterUrl: item.posterUrl,
          backdropUrl: item.backdropUrl,
          overview: item.overview,
          rating: item.rating,
          releaseDate: item.releaseDate,
          releaseYear: item.releaseDate ? new Date(item.releaseDate).getFullYear() : null,
          voteCount: 0,
          genreIds: []
        });
        syncedCount++;
      } catch {
        // Item might already exist in MongoDB account
      }
    }

    try {
      localStorage.removeItem(GUEST_STORAGE_KEY);
    } catch {
      // Ignore
    }

    if (syncedCount > 0) {
      dispatch(
        addToast({
          message: `Synced ${syncedCount} guest ${syncedCount === 1 ? 'title' : 'titles'} to your cloud account!`,
          type: 'success'
        })
      );
    }

    dispatch(fetchWishlist());
  }
);

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggle',
  async (movie: Movie, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as any;
    const isAuth = state.auth.isAuthenticated;
    const isSaved = state.wishlist.movieIds.includes(movie.id);

    // =========================================================
    // 1. GUEST MODE (Local-First Persistence via localStorage)
    // =========================================================
    if (!isAuth) {
      if (isSaved) {
        dispatch(wishlistSlice.actions.optimisticRemove(movie.id));
        const updatedItems = (getState() as any).wishlist.items;
        saveGuestWishlist(updatedItems);
        dispatch(addToast({ message: `"${movie.title}" removed from your watchlist`, type: 'info' }));
        return { movieId: movie.id, action: 'removed' as const };
      } else {
        const guestItem: WishlistItem = {
          id: 'guest_' + movie.id,
          movieId: movie.id,
          title: movie.title,
          posterUrl: movie.posterUrl,
          backdropUrl: movie.backdropUrl,
          overview: movie.overview,
          rating: movie.rating,
          releaseDate: movie.releaseDate,
          createdAt: new Date().toISOString()
        };
        dispatch(wishlistSlice.actions.optimisticAdd(guestItem));
        const updatedItems = (getState() as any).wishlist.items;
        saveGuestWishlist(updatedItems);
        dispatch(addToast({ message: `"${movie.title}" saved to your watchlist`, type: 'success' }));
        return { item: guestItem, action: 'added' as const };
      }
    }

    // =========================================================
    // 2. AUTHENTICATED MODE (Committed to MongoDB Atlas)
    // =========================================================
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
        dispatch(addToast({ message: `"${movie.title}" removed from your watchlist`, type: 'info' }));
        return { movieId: movie.id, action: 'removed' as const };
      } else {
        const added = await wishlistApi.addToWishlist(movie);
        dispatch(addToast({ message: `"${movie.title}" added to your watchlist`, type: 'success' }));
        return { item: added, action: 'added' as const };
      }
    } catch (err: any) {
      // Revert optimistic update on failure
      dispatch(wishlistSlice.actions.rollback({ movie, wasSaved: isSaved }));
      dispatch(addToast({ message: err.message || 'Could not update watchlist', type: 'error' }));
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

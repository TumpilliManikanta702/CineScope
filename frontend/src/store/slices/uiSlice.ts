import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ToastMessage, ToastType } from '../../types';

interface UiState {
  toasts: ToastMessage[];
  mobileMenuOpen: boolean;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register';
}

const initialState: UiState = {
  toasts: [],
  mobileMenuOpen: false,
  authModalOpen: false,
  authModalMode: 'login'
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<{ message: string; type?: ToastType; duration?: number }>) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
      state.toasts.push({
        id,
        message: action.payload.message,
        type: action.payload.type || 'info',
        duration: action.payload.duration || 3500
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    openAuthModal: (state, action: PayloadAction<'login' | 'register' | undefined>) => {
      state.authModalOpen = true;
      state.authModalMode = action.payload || 'login';
    },
    closeAuthModal: (state) => {
      state.authModalOpen = false;
    }
  }
});

export const { addToast, removeToast, setMobileMenuOpen, openAuthModal, closeAuthModal } = uiSlice.actions;
export default uiSlice.reducer;

import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ToastContainer } from '../components/common/ToastContainer';
import { AuthModal } from '../components/auth/AuthModal';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchCurrentUser } from '../store/slices/authSlice';
import { syncGuestWishlist } from '../store/slices/wishlistSlice';

export const RootLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navType = useNavigationType();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  // Restore session and sync wishlist on initial application boot
  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(syncGuestWishlist());
    }
  }, [dispatch, isAuthenticated]);

  // Scroll to top on fresh forward navigation, but preserve viewport position on history back (POP)
  useEffect(() => {
    if (navType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, navType]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      <Navbar />
      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
      <AuthModal />
    </div>
  );
};

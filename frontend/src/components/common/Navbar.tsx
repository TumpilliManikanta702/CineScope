import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Film, Compass, Search, Heart, User as UserIcon, LogOut, Menu, X, LogIn, ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { openAuthModal, addToast } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { clearWishlist } from '../../store/slices/wishlistSlice';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const wishlistCount = useAppSelector((state) => state.wishlist.items.length);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearWishlist());
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    dispatch(addToast({ message: 'Signed out successfully', type: 'info' }));
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { label: 'Discover', path: '/', icon: <Compass size={18} /> },
    { label: 'Search', path: '/search', icon: <Search size={18} /> },
    {
      label: 'Wishlist',
      path: '/wishlist',
      icon: <Heart size={18} />,
      badge: wishlistCount > 0 ? wishlistCount : null
    }
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(11, 13, 19, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'background-color var(--transition-base)'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4.25rem'
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textDecoration: 'none'
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-inverse)',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <Film size={20} strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.35rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)'
            }}
          >
            Cine<span style={{ color: 'var(--color-accent)' }}>Scope</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 0.95rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--color-accent)' : 'var(--text-secondary)',
                  backgroundColor: active ? 'var(--color-accent-subtle)' : 'transparent',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {link.icon}
                <span>{link.label}</span>
                {link.badge !== null && link.badge !== undefined && (
                  <span
                    style={{
                      padding: '0.1rem 0.45rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--text-inverse)',
                      marginLeft: '0.15rem'
                    }}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth Controls */}
        <div style={{ display: 'none', alignItems: 'center', gap: '1rem' }} className="desktop-auth">
          {isAuthenticated && user ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-haspopup="true"
                aria-expanded={userDropdownOpen}
                aria-label={`User menu for ${user.name}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  backgroundColor: userDropdownOpen ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${userDropdownOpen ? 'var(--color-accent)' : 'var(--border-medium)'}`,
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)'
                  }}
                />
                <span>{user.name}</span>
                <ChevronDown
                  size={14}
                  style={{
                    color: 'var(--text-muted)',
                    transform: userDropdownOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform var(--transition-fast)'
                  }}
                />
              </button>

              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    width: '210px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '0.5rem 0',
                    zIndex: 110,
                    backdropFilter: 'blur(16px)'
                  }}
                >
                  {/* User identity summary */}
                  <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email}
                    </p>
                  </div>

                  {/* Dropdown Options */}
                  <div style={{ padding: '0.25rem 0' }}>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        dispatch(addToast({ message: `Active session: ${user.name} (${user.email})`, type: 'info' }));
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.5rem 1rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      <UserIcon size={15} />
                      Profile
                    </button>

                    <Link
                      to="/wishlist"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.5rem 1rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        transition: 'all var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      <Heart size={15} />
                      My Wishlist
                      {wishlistCount > 0 && (
                        <span
                          style={{
                            marginLeft: 'auto',
                            padding: '0.1rem 0.45rem',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--color-accent-subtle)',
                            color: 'var(--color-accent)'
                          }}
                        >
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.25rem 0' }} />

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.5rem 1rem',
                      fontSize: '0.85rem',
                      color: 'var(--color-danger)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => dispatch(openAuthModal('login'))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.15rem',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.color = 'var(--color-accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-medium)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <LogIn size={16} />
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem',
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)'
          }}
          className="mobile-menu-btn"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--bg-canvas)',
            borderBottom: '1px solid var(--border-medium)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}
          className="mobile-drawer"
        >
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.95rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--color-accent)' : 'var(--text-primary)',
                  backgroundColor: active ? 'var(--color-accent-subtle)' : 'var(--bg-surface)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {link.icon}
                  <span>{link.label}</span>
                </div>
                {link.badge !== null && link.badge !== undefined && (
                  <span
                    style={{
                      padding: '0.15rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--text-inverse)'
                    }}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
            {isAuthenticated && user ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Signed in as <strong style={{ color: 'var(--text-primary)' }}>{user.name}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  style={{
                    color: 'var(--color-danger)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  dispatch(openAuthModal('login'));
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--text-inverse)',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <LogIn size={18} />
                Sign In / Join
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .desktop-auth { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
          .mobile-drawer { display: none !important; }
        }
      `}</style>
    </header>
  );
};

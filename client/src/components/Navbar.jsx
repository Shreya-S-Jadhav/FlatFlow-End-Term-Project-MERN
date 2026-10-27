import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Determine which nav links to show
  const residentLinks = [
    { to: '/dashboard', label: 'My Flat' },
    { to: '/my-bills', label: 'Bills' },
    { to: '/payment-history', label: 'History' },
    { to: '/disputes', label: 'Disputes' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Overview' },
    { to: '/admin/flats', label: 'Flats' },
    { to: '/admin/residents', label: 'Residents' },
    { to: '/admin/bills', label: 'Bills' },
    { to: '/admin/disputes', label: 'Disputes' },
  ];

  const navLinks = isAdmin ? adminLinks : residentLinks;

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0.6rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '0.2rem',
          paddingBottom: '0.2rem',
          paddingLeft: '0.85rem',
          paddingRight: '1.25rem',
        }}
      >
        {/* Left: Brand + Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          {/* Brand */}
          <Link
            to="/"
            style={{
              fontWeight: '800',
              fontSize: '1.65rem',
              lineHeight: 1,
              background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 55%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.035em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginLeft: '-0.25rem',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <span style={{ WebkitTextFillColor: 'initial', fontSize: '1.75rem', lineHeight: 1 }}>🏢</span>
            FlatFlow
          </Link>

          {/* Nav Links */}
          {user && (
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {navLinks.map((link) => {
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    style={{
                      padding: '0.42rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      fontWeight: active ? '600' : '500',
                      color: active ? '#1d4ed8' : '#374151',
                      background: active ? '#eff6ff' : '#f9fafb',
                      border: active ? '1.5px solid #3b82f6' : '1px solid #d1d5db',
                      boxShadow: active
                        ? '0 1px 3px rgba(37, 99, 235, 0.15)'
                        : '0 1px 2px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.15s ease',
                      letterSpacing: '0.01em',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = '#f3f4f6';
                        e.currentTarget.style.borderColor = '#9ca3af';
                        e.currentTarget.style.color = '#111827';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = '#f9fafb';
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.color = '#374151';
                      }
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right side (unchanged) */}
        <div>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <NotificationBell />
              <span style={{ fontSize: '0.9rem', color: '#374151' }}>
                <strong>{user.name}</strong>{' '}
                <span className={`badge ${isAdmin ? 'badge-warning' : 'badge-success'}`}>
                  {isAdmin ? 'Admin' : `Flat ${user.flat?.wing || ''}-${user.flat?.flatNumber || ''}`}
                </span>
              </span>
              <button
                onClick={handleLogout}
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                }}
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

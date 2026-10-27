import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: '0.75rem 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/" style={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#111827' }}>
            🏢 FlatFlow
          </Link>
          {user && (
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.95rem' }}>
              {isAdmin ? (
                <>
                  <Link to="/admin">Admin Overview</Link>
                  <Link to="/admin/flats">Manage Flats</Link>
                  <Link to="/admin/residents">Residents</Link>
                  <Link to="/admin/bills">Society Bills</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard">My Flat</Link>
                  <Link to="/my-bills">Maintenance Bills</Link>
                </>
              )}
            </div>
          )}
        </div>

        <div>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
          ) : (
            <Link
              to="/login"
              style={{
                background: '#2563eb',
                color: '#ffffff',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                fontSize: '0.9rem',
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

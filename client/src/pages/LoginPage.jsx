import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LoginPage = ({ initialMode = 'login' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, user } = useAuth();

  // Mode: 'login' or 'register'
  const [mode, setMode] = useState(
    location.pathname === '/register' || initialMode === 'register' ? 'register' : 'login'
  );

  // Sync mode with route changes
  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname]);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [flatId, setFlatId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Flats for registration dropdown
  const [flats, setFlats] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // If already logged in, redirect based on role
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Fetch society flats for registration
  useEffect(() => {
    const fetchFlats = async () => {
      try {
        const res = await api.get('/auth/flats');
        if (res.data?.success) {
          setFlats(res.data.flats || []);
        }
      } catch (err) {
        // Soft fallback
      }
    };
    fetchFlats();
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');
    setSubmitting(true);

    const result = await login(email, password);
    setSubmitting(false);

    if (!result.success) {
      setLocalError(result.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');

    if (regPassword !== confirmPassword) {
      setLocalError('Passwords do not match. Please re-enter.');
      return;
    }

    if (regPassword.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    const result = await register({
      name,
      email: regEmail,
      password: regPassword,
      phone,
      flatId: flatId || undefined,
    });
    setSubmitting(false);

    if (!result.success) {
      setLocalError(result.message);
    } else {
      setSuccessMsg('Account created successfully! Logging you in...');
    }
  };

  // Quick fill helper for easy testing
  const fillCredentials = (demoEmail, demoPass) => {
    setMode('login');
    setEmail(demoEmail);
    setPassword(demoPass);
    setLocalError('');
    setSuccessMsg('');
  };

  return (
    <div className="container" style={{ maxWidth: '460px', marginTop: '2.5rem' }}>
      <div className="card">
        {/* Mode Toggle Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLocalError('');
              setSuccessMsg('');
            }}
            style={{
              flex: 1,
              padding: '0.6rem',
              background: 'transparent',
              border: 'none',
              borderBottom: mode === 'login' ? '2px solid #2563eb' : '2px solid transparent',
              color: mode === 'login' ? '#2563eb' : '#6b7280',
              fontWeight: mode === 'login' ? '600' : '500',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setLocalError('');
              setSuccessMsg('');
            }}
            style={{
              flex: 1,
              padding: '0.6rem',
              background: 'transparent',
              border: 'none',
              borderBottom: mode === 'register' ? '2px solid #2563eb' : '2px solid transparent',
              color: mode === 'register' ? '#2563eb' : '#6b7280',
              fontWeight: mode === 'register' ? '600' : '500',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Create Account
          </button>
        </div>

        <h2 style={{ fontSize: '1.35rem', fontWeight: 'bold', marginBottom: '0.35rem', textAlign: 'center' }}>
          {mode === 'login' ? 'FlatFlow Portal Login' : 'Create Resident Account'}
        </h2>
        <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '1.25rem', textAlign: 'center' }}>
          {mode === 'login'
            ? 'Enter your society credentials to access maintenance & billing.'
            : 'Register a new resident account to access maintenance, billing & disputes.'}
        </p>

        {localError && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.88rem' }}>
            {localError}
          </div>
        )}

        {successMsg && (
          <div style={{ background: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.88rem' }}>
            {successMsg}
          </div>
        )}

        {/* --- SIGN IN FORM --- */}
        {mode === 'login' ? (
          <form id="login-form" onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. resident.a101@flatflow.com"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontWeight: '600',
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Authenticating...' : 'Sign In'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#6b7280', marginTop: '1rem' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setLocalError('');
                }}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer', padding: 0 }}
              >
                Create a new one
              </button>
            </p>
          </form>
        ) : (
          /* --- CREATE ACCOUNT FORM --- */
          <form id="register-form" onSubmit={handleRegisterSubmit}>
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              />
            </div>

            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="e.g. rahul.sharma@example.com"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                  Select Flat
                </label>
                <select
                  value={flatId}
                  onChange={(e) => setFlatId(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', background: '#fff' }}
                >
                  <option value="">-- Choose Flat --</option>
                  {flats.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.wing}-{f.flatNumber} (Fl. {f.floor})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                  Password * (Min 6 chars)
                </label>
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
                >
                  {showRegPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showRegPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Enter password"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                Confirm Password *
              </label>
              <input
                type={showRegPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontWeight: '600',
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#6b7280', marginTop: '1rem' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setLocalError('');
                }}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer', padding: 0 }}
              >
                Sign In
              </button>
            </p>
          </form>
        )}

        {/* Quick Demo Credentials */}
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem', textAlign: 'center' }}>
            Quick Demo Credentials:
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => fillCredentials('admin@flatflow.com', 'admin123')}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', background: '#e5e7eb', border: 'none', borderRadius: '4px' }}
            >
              Fill Admin
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('resident.a101@flatflow.com', 'resident123')}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', background: '#e5e7eb', border: 'none', borderRadius: '4px' }}
            >
              Fill Resident (A-101)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect based on role
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSubmitting(true);

    const result = await login(email, password);
    setSubmitting(false);

    if (!result.success) {
      setLocalError(result.message);
    }
  };

  // Quick fill helper for easy testing
  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLocalError('');
  };

  return (
    <div className="container" style={{ maxWidth: '440px', marginTop: '2.5rem' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center' }}>
          FlatFlow Portal Login
        </h2>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Enter your society credentials to access maintenance & billing.
        </p>

        {localError && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              Password
            </label>
            <input
              type="password"
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
            }}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

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

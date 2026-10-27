import { useState, useEffect } from 'react';
import api from './services/api';

function App() {
  const [serverHealth, setServerHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await api.get('/health');
        setServerHealth(response.data);
      } catch (err) {
        setError(err.message || 'Could not connect to backend server');
      } finally {
        setLoading(false);
      }
    };

    checkBackend();
  }, []);

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>FlatFlow</h1>
        <p style={{ color: '#4b5563' }}>
          Housing Society Maintenance Management & Payment Platform
        </p>
      </header>

      <main className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
          System Connection Status
        </h2>

        {loading && <p>Checking backend connection...</p>}

        {error && (
          <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: '4px' }}>
            Backend Error: {error}
          </div>
        )}

        {serverHealth && (
          <div>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>API Status:</strong>{' '}
              <span className="badge badge-success">Online & Connected</span>
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Message:</strong> {serverHealth.message}
            </p>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              Server Uptime: {serverHealth.uptime} | Checked At: {serverHealth.timestamp}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

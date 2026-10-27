import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [flatCount, setFlatCount] = useState(0);
  const [residentCount, setResidentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [flatsRes, residentsRes] = await Promise.all([
          api.get('/admin/flats'),
          api.get('/admin/residents'),
        ]);
        setFlatCount(flatsRes.data?.count || 0);
        setResidentCount(residentsRes.data?.count || 0);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="container" style={{ marginTop: '1.5rem' }}>
      <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          Society Administration Dashboard
        </h1>
        <p style={{ color: '#4b5563', fontSize: '0.95rem' }}>
          Logged in as {user?.name} (Administrator)
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#6b7280', textTransform: 'uppercase' }}>Total Registered Flats</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginTop: '0.5rem' }}>
            {loading ? '...' : flatCount}
          </p>
          <Link to="/admin/flats" style={{ display: 'inline-block', marginTop: '0.5rem', color: '#2563eb', fontSize: '0.85rem' }}>
            Manage Flats →
          </Link>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#6b7280', textTransform: 'uppercase' }}>Active Residents</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginTop: '0.5rem' }}>
            {loading ? '...' : residentCount}
          </p>
          <Link to="/admin/residents" style={{ display: 'inline-block', marginTop: '0.5rem', color: '#2563eb', fontSize: '0.85rem' }}>
            Manage Residents →
          </Link>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '1rem' }}>Society Management Quick Links</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            to="/admin/flats"
            style={{ padding: '0.5rem 1rem', background: '#e5e7eb', borderRadius: '4px', color: '#111827', fontWeight: '500' }}
          >
            🏢 Flat Directory & Configuration
          </Link>
          <Link
            to="/admin/residents"
            style={{ padding: '0.5rem 1rem', background: '#e5e7eb', borderRadius: '4px', color: '#111827', fontWeight: '500' }}
          >
            👥 Resident Accounts & Associations
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

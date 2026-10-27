import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ResidentDashboard = () => {
  const { user } = useAuth();
  const flat = user?.flat;

  return (
    <div className="container" style={{ marginTop: '1.5rem' }}>
      <div className="card" style={{ borderLeft: '4px solid #2563eb' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          Welcome back, {user?.name}!
        </h1>
        <p style={{ color: '#4b5563', fontSize: '0.95rem' }}>
          Resident Portal — Maintenance & Billing Management
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* Associated Flat Details Card */}
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
            My Flat Association
          </h2>
          {flat ? (
            <div>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Flat Identifier:</strong> Wing {flat.wing} - Flat {flat.flatNumber}
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Floor:</strong> Floor {flat.floor}
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Base Monthly Maintenance:</strong> ₹{flat.maintenanceBaseAmount}
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Occupancy Status:</strong>{' '}
                <span className="badge badge-success">{flat.status}</span>
              </p>
            </div>
          ) : (
            <p style={{ color: '#dc2626' }}>No flat currently associated. Please contact society administration.</p>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
            Maintenance & Payments
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>
            View your issued society maintenance bills, check due dates, and track payment receipts.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              to="/my-bills"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '0.6rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                borderRadius: '4px',
                fontWeight: '600',
              }}
            >
              View My Bills & Pay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;

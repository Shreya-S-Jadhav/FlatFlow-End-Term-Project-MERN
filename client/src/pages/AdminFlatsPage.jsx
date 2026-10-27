import { useState, useEffect } from 'react';
import api from '../services/api';

const AdminFlatsPage = () => {
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [wing, setWing] = useState('A');
  const [flatNumber, setFlatNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [maintenanceBaseAmount, setMaintenanceBaseAmount] = useState(2500);
  const [submitting, setSubmitting] = useState(false);

  const fetchFlats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/flats');
      setFlats(res.data?.flats || []);
    } catch (err) {
      setError('Failed to fetch society flat directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlats();
  }, []);

  const handleCreateFlat = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await api.post('/admin/flats', {
        wing,
        flatNumber,
        floor: Number(floor),
        ownerName,
        contactNumber,
        maintenanceBaseAmount: Number(maintenanceBaseAmount),
      });

      setSuccess(`Flat ${wing}-${flatNumber} created successfully.`);
      setFlatNumber('');
      setFloor('');
      setOwnerName('');
      setContactNumber('');
      fetchFlats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create flat record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Society Flat Directory
      </h1>

      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ background: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>{success}</div>}

      {/* Add New Flat Form */}
      <div className="card">
        <h2 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '1rem' }}>Register New Flat</h2>
        <form onSubmit={handleCreateFlat} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Wing / Block</label>
            <input
              type="text"
              required
              value={wing}
              onChange={(e) => setWing(e.target.value.toUpperCase())}
              placeholder="e.g. A"
              style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Flat Number</label>
            <input
              type="text"
              required
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
              placeholder="e.g. 101"
              style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Floor</label>
            <input
              type="number"
              required
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              placeholder="e.g. 1"
              style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Owner / Primary Contact</label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Full name"
              style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Contact Phone</label>
            <input
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="Phone number"
              style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Base Maintenance (₹)</label>
            <input
              type="number"
              value={maintenanceBaseAmount}
              onChange={(e) => setMaintenanceBaseAmount(e.target.value)}
              placeholder="2500"
              style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{ width: '100%', padding: '0.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600' }}
            >
              {submitting ? 'Saving...' : '+ Add Flat'}
            </button>
          </div>
        </form>
      </div>

      {/* Flats Table */}
      <div className="card">
        <h2 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '1rem' }}>
          Existing Society Flats ({flats.length})
        </h2>

        {loading ? (
          <p>Loading flats...</p>
        ) : flats.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No flats registered yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                  <th style={{ padding: '0.5rem' }}>Wing & Flat</th>
                  <th style={{ padding: '0.5rem' }}>Floor</th>
                  <th style={{ padding: '0.5rem' }}>Owner</th>
                  <th style={{ padding: '0.5rem' }}>Phone</th>
                  <th style={{ padding: '0.5rem' }}>Status</th>
                  <th style={{ padding: '0.5rem' }}>Base Maintenance</th>
                </tr>
              </thead>
              <tbody>
                {flats.map((flat) => (
                  <tr key={flat._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.5rem', fontWeight: '600' }}>
                      {flat.wing}-{flat.flatNumber}
                    </td>
                    <td style={{ padding: '0.5rem' }}>{flat.floor}</td>
                    <td style={{ padding: '0.5rem' }}>{flat.ownerName || '—'}</td>
                    <td style={{ padding: '0.5rem' }}>{flat.contactNumber || '—'}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <span className="badge badge-success">{flat.status}</span>
                    </td>
                    <td style={{ padding: '0.5rem' }}>₹{flat.maintenanceBaseAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFlatsPage;

import { useState, useEffect } from 'react';
import api from '../services/api';

const AdminResidentsPage = () => {
  const [residents, setResidents] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [flatId, setFlatId] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resResidents, resFlats] = await Promise.all([
        api.get('/admin/residents'),
        api.get('/admin/flats'),
      ]);
      setResidents(resResidents.data?.residents || []);
      setFlats(resFlats.data?.flats || []);
      if (resFlats.data?.flats?.length > 0 && !flatId) {
        setFlatId(resFlats.data.flats[0]._id);
      }
    } catch (err) {
      setError('Failed to fetch resident accounts and flats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateResident = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await api.post('/admin/residents', {
        name,
        email,
        password,
        flatId,
        phone,
      });

      setSuccess(`Resident account created for ${name}.`);
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create resident account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Resident Accounts & Flat Associations
      </h1>

      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ background: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>{success}</div>}

      {/* Add Resident Form */}
      <div className="card">
        <h2 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '1rem' }}>Create Resident Account</h2>
        <form onSubmit={handleCreateResident} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kulkarni"
              style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="resident@flatflow.com"
              style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Temporary Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Assign to Flat</label>
            <select
              value={flatId}
              onChange={(e) => setFlatId(e.target.value)}
              required
              style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            >
              {flats.map((f) => (
                <option key={f._id} value={f._id}>
                  Wing {f.wing} - Flat {f.flatNumber} (Floor {f.floor})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Contact Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit number"
              style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{ width: '100%', padding: '0.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600' }}
            >
              {submitting ? 'Creating...' : '+ Create Account'}
            </button>
          </div>
        </form>
      </div>

      {/* Resident Accounts Table */}
      <div className="card">
        <h2 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '1rem' }}>
          Registered Resident Accounts ({residents.length})
        </h2>

        {loading ? (
          <p>Loading resident accounts...</p>
        ) : residents.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No resident accounts registered yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                  <th style={{ padding: '0.5rem' }}>Resident Name</th>
                  <th style={{ padding: '0.5rem' }}>Email</th>
                  <th style={{ padding: '0.5rem' }}>Assigned Flat</th>
                  <th style={{ padding: '0.5rem' }}>Phone</th>
                  <th style={{ padding: '0.5rem' }}>Account Status</th>
                </tr>
              </thead>
              <tbody>
                {residents.map((r) => (
                  <tr key={r._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.5rem', fontWeight: '600' }}>{r.name}</td>
                    <td style={{ padding: '0.5rem' }}>{r.email}</td>
                    <td style={{ padding: '0.5rem' }}>
                      {r.flat ? `Wing ${r.flat.wing}-${r.flat.flatNumber}` : 'Unassigned'}
                    </td>
                    <td style={{ padding: '0.5rem' }}>{r.phone || '—'}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <span className="badge badge-success">{r.status}</span>
                    </td>
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

export default AdminResidentsPage;

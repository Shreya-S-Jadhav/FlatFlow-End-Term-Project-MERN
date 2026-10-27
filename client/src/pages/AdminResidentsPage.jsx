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

  // Edit Resident state
  const [editingResident, setEditingResident] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editFlatId, setEditFlatId] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [editPassword, setEditPassword] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

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

  const handleOpenEdit = (resident) => {
    setEditingResident(resident);
    setEditName(resident.name);
    setEditEmail(resident.email);
    setEditPhone(resident.phone || '');
    setEditFlatId(resident.flat?._id || resident.flat || '');
    setEditStatus(resident.status || 'active');
    setEditPassword('');
  };

  const handleCloseEdit = () => {
    setEditingResident(null);
  };

  const handleUpdateResident = async (e) => {
    e.preventDefault();
    if (!editingResident) return;
    setError('');
    setSuccess('');
    setSavingEdit(true);

    try {
      const payload = {
        name: editName,
        email: editEmail,
        phone: editPhone,
        flatId: editFlatId,
        status: editStatus,
      };
      if (editPassword && editPassword.trim()) {
        payload.password = editPassword.trim();
      }

      await api.put(`/admin/residents/${editingResident._id}`, payload);

      setSuccess(`Resident account for ${editName} updated successfully.`);
      handleCloseEdit();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update resident account.');
    } finally {
      setSavingEdit(false);
    }
  };


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
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Action</th>
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
                      <span className={`badge ${r.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenEdit(r)}
                        style={{
                          padding: '0.3rem 0.65rem',
                          background: '#f3f4f6',
                          color: '#1f2937',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                        }}
                      >
                        ✏️ Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Resident Modal */}
      {editingResident && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '520px',
              width: '100%',
              background: '#fff',
              borderRadius: '8px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                Edit Resident ({editingResident.name})
              </h2>
              <button
                onClick={handleCloseEdit}
                style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#6b7280' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateResident} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Assigned Flat</label>
                <select
                  value={editFlatId}
                  onChange={(e) => setEditFlatId(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="">Unassigned</option>
                  {flats.map((f) => (
                    <option key={f._id} value={f._id}>
                      Wing {f.wing} - Flat {f.flatNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Contact Phone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Phone number"
                  style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Account Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>
                  Reset Password <span style={{ fontWeight: 'normal', color: '#6b7280' }}>(Optional)</span>
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  style={{ padding: '0.5rem 1rem', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResidentsPage;

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

  // Edit Flat state
  const [editingFlat, setEditingFlat] = useState(null);
  const [editWing, setEditWing] = useState('');
  const [editFlatNumber, setEditFlatNumber] = useState('');
  const [editFloor, setEditFloor] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editContactNumber, setEditContactNumber] = useState('');
  const [editStatus, setEditStatus] = useState('occupied');
  const [editMaintenanceBaseAmount, setEditMaintenanceBaseAmount] = useState(2500);
  const [savingEdit, setSavingEdit] = useState(false);

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

  const handleOpenEdit = (flat) => {
    setEditingFlat(flat);
    setEditWing(flat.wing);
    setEditFlatNumber(flat.flatNumber);
    setEditFloor(flat.floor);
    setEditOwnerName(flat.ownerName || '');
    setEditContactNumber(flat.contactNumber || '');
    setEditStatus(flat.status || 'occupied');
    setEditMaintenanceBaseAmount(flat.maintenanceBaseAmount || 2500);
  };

  const handleCloseEdit = () => {
    setEditingFlat(null);
  };

  const handleUpdateFlat = async (e) => {
    e.preventDefault();
    if (!editingFlat) return;
    setError('');
    setSuccess('');
    setSavingEdit(true);

    try {
      await api.put(`/admin/flats/${editingFlat._id}`, {
        wing: editWing,
        flatNumber: editFlatNumber,
        floor: Number(editFloor),
        ownerName: editOwnerName,
        contactNumber: editContactNumber,
        status: editStatus,
        maintenanceBaseAmount: Number(editMaintenanceBaseAmount),
      });

      setSuccess(`Flat ${editWing}-${editFlatNumber} updated successfully.`);
      handleCloseEdit();
      fetchFlats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update flat details.');
    } finally {
      setSavingEdit(false);
    }
  };

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
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Action</th>
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
                      <span className={`badge ${flat.status === 'occupied' ? 'badge-success' : 'badge-warning'}`}>
                        {flat.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem' }}>₹{flat.maintenanceBaseAmount}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenEdit(flat)}
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

      {/* Edit Flat Modal */}
      {editingFlat && (
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
                Edit Flat {editingFlat.wing}-{editingFlat.flatNumber}
              </h2>
              <button
                onClick={handleCloseEdit}
                style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#6b7280' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateFlat} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Wing</label>
                <input
                  type="text"
                  required
                  value={editWing}
                  onChange={(e) => setEditWing(e.target.value.toUpperCase())}
                  style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Flat Number</label>
                <input
                  type="text"
                  required
                  value={editFlatNumber}
                  onChange={(e) => setEditFlatNumber(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Floor</label>
                <input
                  type="number"
                  required
                  value={editFloor}
                  onChange={(e) => setEditFloor(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="occupied">Occupied</option>
                  <option value="vacant">Vacant</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Owner / Primary Contact</label>
                <input
                  type="text"
                  value={editOwnerName}
                  onChange={(e) => setEditOwnerName(e.target.value)}
                  placeholder="Full name"
                  style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Contact Phone</label>
                <input
                  type="text"
                  value={editContactNumber}
                  onChange={(e) => setEditContactNumber(e.target.value)}
                  placeholder="Phone number"
                  style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Base Maintenance (₹)</label>
                <input
                  type="number"
                  required
                  value={editMaintenanceBaseAmount}
                  onChange={(e) => setEditMaintenanceBaseAmount(e.target.value)}
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

export default AdminFlatsPage;

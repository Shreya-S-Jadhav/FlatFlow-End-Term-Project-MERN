import { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDisputesPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected Dispute for Review
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [newStatus, setNewStatus] = useState('under_review');
  const [adminResponse, setAdminResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      setError('');
      const queryParam = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/disputes/admin/all${queryParam}`);
      setDisputes(res.data?.disputes || []);
    } catch (err) {
      setError('Failed to fetch society disputes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter]);

  const handleOpenReview = (disp) => {
    setSelectedDispute(disp);
    setNewStatus(disp.status === 'open' ? 'under_review' : disp.status);
    setAdminResponse(disp.adminResponse || '');
  };

  const handleUpdateDispute = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.patch(`/disputes/admin/${selectedDispute._id}`, {
        status: newStatus,
        adminResponse,
      });

      setSuccess(`Dispute ${selectedDispute.disputeNumber} updated to ${newStatus}.`);
      setSelectedDispute(null);
      fetchDisputes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update dispute.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '1.5rem', marginBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            Society Billing Disputes
          </h1>
          <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>
            Review, investigate, and resolve resident billing inquiries and adjustments.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem' }}
        >
          <option value="all">All Disputes</option>
          <option value="open">Open</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ background: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>{success}</div>}

      {/* Review & Resolution Modal */}
      {selectedDispute && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div className="card" style={{ maxWidth: '540px', width: '90%', margin: '1rem', position: 'relative' }}>
            <button
              onClick={() => setSelectedDispute(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              ✕
            </button>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>
              Investigate Dispute ({selectedDispute.disputeNumber})
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Flat {selectedDispute.flat?.wing}-{selectedDispute.flat?.flatNumber} | Resident: {selectedDispute.resident?.name} ({selectedDispute.resident?.phone || 'No phone'})
            </p>

            <div style={{ background: '#f9fafb', padding: '0.8rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <p><strong>Bill:</strong> {selectedDispute.bill?.billNumber} (Amount: ₹{selectedDispute.bill?.totalAmount})</p>
              <p style={{ marginTop: '0.25rem' }}><strong>Subject:</strong> {selectedDispute.subject}</p>
              <p style={{ marginTop: '0.25rem' }}><strong>Claim:</strong> {selectedDispute.description}</p>
              {selectedDispute.supportingDocument?.filename && (
                <p style={{ marginTop: '0.5rem' }}>
                  <a
                    href={`http://localhost:5000/api/disputes/document/${selectedDispute._id}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#2563eb', fontWeight: '600' }}
                  >
                    📎 Open Resident Evidence Attachment
                  </a>
                </p>
              )}
            </div>

            <form onSubmit={handleUpdateDispute}>
              <div style={{ marginBottom: '0.8rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>
                  Update Dispute Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved (Approved / Corrected)</option>
                  <option value="rejected">Rejected (Bill is accurate)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>
                  Treasurer Official Remarks
                </label>
                <textarea
                  required
                  rows={3}
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Explain resolution (e.g. Credit adjustment of ₹150 will be reflected on next month bill)..."
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedDispute(null)}
                  style={{ padding: '0.45rem 0.9rem', border: '1px solid #d1d5db', borderRadius: '4px', background: '#fff' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '0.45rem 1.1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600' }}
                >
                  {submitting ? 'Saving...' : 'Record Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disputes Table */}
      <div className="card">
        {loading ? (
          <p>Loading society disputes...</p>
        ) : disputes.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No disputes found for this filter.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                  <th style={{ padding: '0.6rem' }}>Dispute #</th>
                  <th style={{ padding: '0.6rem' }}>Flat</th>
                  <th style={{ padding: '0.6rem' }}>Resident</th>
                  <th style={{ padding: '0.6rem' }}>Subject</th>
                  <th style={{ padding: '0.6rem' }}>Priority</th>
                  <th style={{ padding: '0.6rem' }}>Status</th>
                  <th style={{ padding: '0.6rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((d) => (
                  <tr key={d._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.6rem', fontWeight: '600' }}>{d.disputeNumber}</td>
                    <td style={{ padding: '0.6rem' }}>
                      Wing {d.flat?.wing}-{d.flat?.flatNumber}
                    </td>
                    <td style={{ padding: '0.6rem' }}>{d.resident?.name}</td>
                    <td style={{ padding: '0.6rem' }}>{d.subject}</td>
                    <td style={{ padding: '0.6rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          fontWeight: 'bold',
                          color: d.priority === 'high' ? '#dc2626' : '#4b5563',
                        }}
                      >
                        {d.priority}
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem' }}>
                      <span
                        className={`badge ${
                          d.status === 'resolved'
                            ? 'badge-success'
                            : d.status === 'under_review'
                            ? 'badge-warning'
                            : d.status === 'rejected'
                            ? 'badge-danger'
                            : ''
                        }`}
                        style={{
                          background: d.status === 'open' ? '#dbeafe' : undefined,
                          color: d.status === 'open' ? '#1e40af' : undefined,
                        }}
                      >
                        {d.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenReview(d)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          background: '#2563eb',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                        }}
                      >
                        Investigate
                      </button>
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

export default AdminDisputesPage;

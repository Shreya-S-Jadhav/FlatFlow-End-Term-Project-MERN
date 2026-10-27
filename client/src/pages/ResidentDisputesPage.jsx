import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ResidentDisputesPage = () => {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [billId, setBillId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [disputesRes, billsRes] = await Promise.all([
        api.get('/disputes/my-disputes'),
        api.get('/bills/my-bills'),
      ]);
      setDisputes(disputesRes.data?.disputes || []);
      setBills(billsRes.data?.bills || []);
      if (billsRes.data?.bills?.length > 0 && !billId) {
        setBillId(billsRes.data.bills[0]._id);
      }
    } catch (err) {
      setError('Failed to load disputes and bills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitDispute = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('billId', billId);
      formData.append('subject', subject);
      formData.append('description', description);
      formData.append('priority', priority);
      if (file) {
        formData.append('evidence', file);
      }

      await api.post('/disputes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Billing dispute submitted. Society administration has been alerted.');
      setShowModal(false);
      setSubject('');
      setDescription('');
      setFile(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit dispute.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return <span className="badge badge-success">Resolved</span>;
      case 'under_review':
        return <span className="badge badge-warning">Under Review</span>;
      case 'rejected':
        return <span className="badge badge-danger">Rejected</span>;
      default:
        return <span className="badge" style={{ background: '#dbeafe', color: '#1e40af' }}>Open</span>;
    }
  };

  return (
    <div className="container" style={{ marginTop: '1.5rem', marginBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            Billing Queries & Disputes
          </h1>
          <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>
            Raise inquiries or dispute incorrect maintenance charges for your flat.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '0.5rem 1rem',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontWeight: '600',
            fontSize: '0.85rem',
          }}
        >
          + Raise Billing Dispute
        </button>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ background: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>{success}</div>}

      {/* Raise Dispute Modal */}
      {showModal && (
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
          <div className="card" style={{ maxWidth: '500px', width: '90%', margin: '1rem', position: 'relative' }}>
            <button
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              ✕
            </button>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              File Maintenance Dispute
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Submit billing concerns directly to the society treasurer.
            </p>

            <form onSubmit={handleSubmitDispute}>
              <div style={{ marginBottom: '0.8rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>
                  Related Bill
                </label>
                <select
                  value={billId}
                  onChange={(e) => setBillId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  {bills.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.billNumber} — {b.billingPeriodName} (₹{b.totalAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '0.8rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Incorrect adjustment / Water charge calculation"
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '0.8rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>
                  Detailed Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the specific issue with dates, payments, or meter numbers..."
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>
                    Evidence (PDF / Photo)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    style={{ fontSize: '0.8rem', width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.45rem 0.9rem', border: '1px solid #d1d5db', borderRadius: '4px', background: '#fff' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '0.45rem 1.1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disputes List */}
      <div className="card">
        {loading ? (
          <p>Loading dispute history...</p>
        ) : disputes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            <p style={{ marginBottom: '0.5rem' }}>No billing disputes raised for your flat.</p>
            <p style={{ fontSize: '0.85rem' }}>If you notice an unexpected fee on your maintenance bill, you can submit a dispute here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {disputes.map((d) => (
              <div key={d._id} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '1rem', background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', fontSize: '1rem', marginRight: '0.5rem' }}>{d.subject}</span>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>({d.disputeNumber})</span>
                  </div>
                  {getStatusBadge(d.status)}
                </div>

                <p style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '0.5rem' }}>
                  {d.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6b7280', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span>
                    Bill: <strong>{d.bill?.billNumber}</strong> ({d.bill?.billingPeriodName})
                  </span>
                  <span>Filed on: {new Date(d.createdAt).toLocaleDateString()}</span>
                  {d.supportingDocument?.filename && (
                    <a
                      href={`http://localhost:5000/api/disputes/document/${d._id}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#2563eb', fontWeight: '500' }}
                    >
                      📎 View Attached Evidence
                    </a>
                  )}
                </div>

                {/* Admin Response Drawer */}
                {d.adminResponse && (
                  <div style={{ marginTop: '0.75rem', background: '#f8fafc', borderLeft: '3px solid #2563eb', padding: '0.6rem 0.8rem', borderRadius: '4px' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1e40af' }}>Treasurer Response:</p>
                    <p style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.2rem' }}>{d.adminResponse}</p>
                    {d.resolvedAt && (
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                        Updated on {new Date(d.resolvedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentDisputesPage;

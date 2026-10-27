import { useState, useEffect } from 'react';
import api from '../services/api';
import { formatDate } from '../utils/dateFormatter';

const AdminBillsPage = () => {
  const [bills, setBills] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Reminders State
  const [sendingReminders, setSendingReminders] = useState(false);

  // Batch Generation State
  const [batchPeriod, setBatchPeriod] = useState('2026-11');
  const [batchDueDate, setBatchDueDate] = useState('2026-11-15');
  const [generatingBatch, setGeneratingBatch] = useState(false);

  // Single Bill Generator State
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [singleFlatId, setSingleFlatId] = useState('');
  const [singlePeriod, setSinglePeriod] = useState('2026-11');
  const [singleDueDate, setSingleDueDate] = useState('2026-11-15');
  const [adjustments, setAdjustments] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [submittingSingle, setSubmittingSingle] = useState(false);


  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [billsRes, flatsRes] = await Promise.all([
        api.get(`/bills/admin/all?status=${statusFilter}&search=${search}`),
        api.get('/admin/flats'),
      ]);
      setBills(billsRes.data?.bills || []);
      setFlats(flatsRes.data?.flats || []);
      if (flatsRes.data?.flats?.length > 0 && !singleFlatId) {
        setSingleFlatId(flatsRes.data.flats[0]._id);
      }
    } catch (err) {
      setError('Failed to fetch society bills or flats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleBatchGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setGeneratingBatch(true);

    try {
      const res = await api.post('/bills/admin/generate-batch', {
        billingPeriod: batchPeriod,
        dueDate: batchDueDate,
      });

      setSuccess(res.data?.message || 'Batch bills generated successfully.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate batch bills.');
    } finally {
      setGeneratingBatch(false);
    }
  };

  const handleSingleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmittingSingle(true);

    try {
      const res = await api.post('/bills/admin/generate-single', {
        flatId: singleFlatId,
        billingPeriod: singlePeriod,
        dueDate: singleDueDate,
        adjustments: Number(adjustments),
        adjustmentReason,
      });

      setSuccess(res.data?.message || 'Single bill generated successfully.');
      setShowSingleModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate single bill.');
    } finally {
      setSubmittingSingle(false);
    }
  };

  const handleSendReminders = async () => {
    setError('');
    setSuccess('');
    setSendingReminders(true);
    try {
      const res = await api.post('/bills/admin/send-due-reminders', { force: true });
      setSuccess(res.data.message || 'Due date reminder notifications dispatched successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send due date reminder notifications.');
    } finally {
      setSendingReminders(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          Society Maintenance Billing
        </h1>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSendReminders}
            disabled={sendingReminders}
            style={{
              padding: '0.5rem 1rem',
              background: '#059669',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: sendingReminders ? 'not-allowed' : 'pointer',
              opacity: sendingReminders ? 0.7 : 1,
            }}
          >
            {sendingReminders ? 'Sending...' : '🔔 Send Due Date Reminders'}
          </button>

          <button
            onClick={() => setShowSingleModal(!showSingleModal)}
            style={{
              padding: '0.5rem 1rem',
              background: showSingleModal ? '#4b5563' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {showSingleModal ? 'Close Single Generator' : '+ Issue Individual Flat Bill'}
          </button>
        </div>
      </div>


      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ background: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>{success}</div>}

      {/* Individual Bill Generator Drawer */}
      {showSingleModal && (
        <div className="card" style={{ borderLeft: '4px solid #2563eb', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '1rem' }}>
            Generate Individual Flat Maintenance Bill
          </h2>
          <form onSubmit={handleSingleGenerate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Target Flat</label>
              <select
                value={singleFlatId}
                onChange={(e) => setSingleFlatId(e.target.value)}
                style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
              >
                {flats.map((f) => (
                  <option key={f._id} value={f._id}>
                    Wing {f.wing}-{f.flatNumber} (Base ₹{f.maintenanceBaseAmount})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Billing Period (YYYY-MM)</label>
              <input
                type="text"
                required
                value={singlePeriod}
                onChange={(e) => setSinglePeriod(e.target.value)}
                placeholder="2026-11"
                style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Due Date</label>
              <input
                type="date"
                required
                value={singleDueDate}
                onChange={(e) => setSingleDueDate(e.target.value)}
                style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Adjustments (₹ +/-)</label>
              <input
                type="number"
                value={adjustments}
                onChange={(e) => setAdjustments(e.target.value)}
                placeholder="0"
                style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Adjustment Reason</label>
              <input
                type="text"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="e.g. Repairs or Credit"
                style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="submit"
                disabled={submittingSingle}
                style={{ width: '100%', padding: '0.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600' }}
              >
                {submittingSingle ? 'Generating...' : 'Issue Bill'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Monthly Generator Card */}
      <div className="card" style={{ background: '#f8fafc' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          ⚡ 1-Click Monthly Society Bulk Generation
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Automatically issues maintenance bills for all registered society flats based on each flat's base rate. Duplicate cycles for any flat are safely skipped.
        </p>

        <form onSubmit={handleBatchGenerate} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Billing Month (YYYY-MM)</label>
            <input
              type="text"
              required
              value={batchPeriod}
              onChange={(e) => setBatchPeriod(e.target.value)}
              placeholder="e.g. 2026-11"
              style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>Due Date</label>
            <input
              type="date"
              required
              value={batchDueDate}
              onChange={(e) => setBatchDueDate(e.target.value)}
              style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            />
          </div>

          <button
            type="submit"
            disabled={generatingBatch}
            style={{
              padding: '0.5rem 1.25rem',
              background: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: '600',
            }}
          >
            {generatingBatch ? 'Processing Society Bills...' : 'Generate Batch For All Flats'}
          </button>
        </form>
      </div>

      {/* Society Bills Table & Filters */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '600' }}>
            Issued Society Bills ({bills.length})
          </h2>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.35rem' }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Bill #"
                style={{ padding: '0.35rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem' }}
              />
              <button
                type="submit"
                style={{ padding: '0.35rem 0.75rem', background: '#374151', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.85rem' }}
              >
                Search
              </button>
            </form>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.35rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem' }}
            >
              <option value="all">All Statuses</option>
              <option value="unpaid">Unpaid</option>
              <option value="overdue">Overdue</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading society bills...</p>
        ) : bills.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No bills match your criteria.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                  <th style={{ padding: '0.5rem' }}>Bill Reference</th>
                  <th style={{ padding: '0.5rem' }}>Flat</th>
                  <th style={{ padding: '0.5rem' }}>Billing Period</th>
                  <th style={{ padding: '0.5rem' }}>Due Date</th>
                  <th style={{ padding: '0.5rem' }}>Total Amount</th>
                  <th style={{ padding: '0.5rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => (
                  <tr key={b._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.5rem', fontWeight: '600' }}>{b.billNumber}</td>
                    <td style={{ padding: '0.5rem' }}>
                      {b.flat ? `Wing ${b.flat.wing}-${b.flat.flatNumber}` : '—'}
                    </td>
                    <td style={{ padding: '0.5rem' }}>{b.billingPeriodName}</td>
                    <td style={{ padding: '0.5rem' }}>{formatDate(b.dueDate)}</td>
                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>₹{b.totalAmount}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <span
                        className={`badge ${
                          b.status === 'paid'
                            ? 'badge-success'
                            : b.status === 'overdue'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {b.status}
                      </span>
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

export default AdminBillsPage;

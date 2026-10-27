import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import { formatDate } from '../utils/dateFormatter';

const ResidentBillsPage = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingBill, setPayingBill] = useState(null);

  const fetchMyBills = async () => {
    try {
      setLoading(true);
      setError('');
      const queryParam = filterStatus !== 'all' ? `?status=${filterStatus}` : '';
      const res = await api.get(`/bills/my-bills${queryParam}`);
      setBills(res.data?.bills || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your flat bills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBills();
  }, [filterStatus]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="badge badge-success">Paid</span>;
      case 'overdue':
        return <span className="badge badge-danger">Overdue</span>;
      case 'unpaid':
        return <span className="badge badge-warning">Unpaid</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="container" style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            My Maintenance Bills
          </h1>
          <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>
            Associated Flat: Wing {user?.flat?.wing} - Flat {user?.flat?.flatNumber}
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.4rem',
          background: '#f8fafc',
          padding: '0.35rem',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
        }}>
          {[
            { key: 'all', label: 'All', icon: '📋', activeBg: '#2563eb', activeBorder: '#1d4ed8' },
            { key: 'unpaid', label: 'Unpaid', icon: '⏳', activeBg: '#f59e0b', activeBorder: '#d97706' },
            { key: 'overdue', label: 'Overdue', icon: '🔴', activeBg: '#ef4444', activeBorder: '#dc2626' },
            { key: 'paid', label: 'Paid', icon: '✅', activeBg: '#10b981', activeBorder: '#059669' },
          ].map((tab) => {
            const active = filterStatus === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: '8px',
                  border: active ? `1.5px solid ${tab.activeBorder}` : '1px solid #d1d5db',
                  background: active ? tab.activeBg : '#ffffff',
                  color: active ? '#ffffff' : '#374151',
                  fontWeight: active ? '600' : '500',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: active ? '0 2px 6px rgba(0,0,0,0.16)' : '0 1px 2px rgba(0,0,0,0.05)',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#9ca3af';
                    e.currentTarget.style.color = '#111827';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.color = '#374151';
                  }
                }}
              >
                <span style={{ fontSize: '0.85rem' }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading maintenance bills...</p>
      ) : bills.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: '#6b7280' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No bills found for the selected filter.</p>
          <p style={{ fontSize: '0.85rem' }}>Your flat is up to date with society maintenance dues.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {bills.map((bill) => (
            <div key={bill._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>{bill.billingPeriodName}</span>
                  {getStatusBadge(bill.status)}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.2rem' }}>
                  Bill Reference: <strong>{bill.billNumber}</strong>
                </p>
                <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  Issue Date: {formatDate(bill.issueDate)} | Due Date:{' '}
                  <span style={{ color: bill.status === 'overdue' ? '#dc2626' : 'inherit', fontWeight: bill.status === 'overdue' ? '600' : 'normal' }}>
                    {formatDate(bill.dueDate)}
                  </span>
                </p>
                {bill.adjustments !== 0 && (
                  <p style={{ fontSize: '0.8rem', color: '#4b5563', marginTop: '0.25rem' }}>
                    Includes Adjustment: ₹{bill.adjustments} ({bill.adjustmentReason || 'Society credit/charge'})
                  </p>
                )}
                {bill.paidAt && (
                  <p style={{ fontSize: '0.8rem', color: '#059669', marginTop: '0.25rem' }}>
                    Paid on {formatDate(bill.paidAt)}
                  </p>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                  ₹{bill.totalAmount}
                </p>

                {bill.status === 'paid' ? (
                  <button
                    disabled
                    style={{
                      padding: '0.4rem 0.8rem',
                      background: '#e5e7eb',
                      color: '#4b5563',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      cursor: 'not-allowed',
                    }}
                  >
                    ✓ Paid
                  </button>
                ) : (
                  <button
                    onClick={() => setPayingBill(bill)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                    }}
                  >
                    Pay Bill ₹{bill.totalAmount}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Checkout Modal */}
      {payingBill && (
        <PaymentModal
          bill={payingBill}
          onClose={() => setPayingBill(null)}
          onPaymentSuccess={() => {
            fetchMyBills();
            setPayingBill(null);
          }}
        />
      )}
    </div>
  );
};

export default ResidentBillsPage;

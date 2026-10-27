import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/dateFormatter';

const PaymentHistoryPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/payments/my-payments');
        setPayments(res.data?.payments || []);
      } catch (err) {
        setError('Failed to load payment transaction history.');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="container" style={{ marginTop: '1.5rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          Payment History & Receipts
        </h1>
        <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>
          Verified maintenance receipts for Wing {user?.flat?.wing} - Flat {user?.flat?.flatNumber}
        </p>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}

      <div className="card">
        {loading ? (
          <p>Loading transactions...</p>
        ) : payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            <p style={{ marginBottom: '0.5rem' }}>No payment receipts recorded yet.</p>
            <Link to="/my-bills" style={{ color: '#2563eb', fontWeight: '600' }}>
              View and pay your pending bills →
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                  <th style={{ padding: '0.6rem' }}>Receipt Number</th>
                  <th style={{ padding: '0.6rem' }}>Billing Period</th>
                  <th style={{ padding: '0.6rem' }}>Amount</th>
                  <th style={{ padding: '0.6rem' }}>Method</th>
                  <th style={{ padding: '0.6rem' }}>Date & Time</th>
                  <th style={{ padding: '0.6rem', textAlign: 'right' }}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.6rem', fontWeight: '600' }}>{p.receiptNumber}</td>
                    <td style={{ padding: '0.6rem' }}>{p.bill?.billingPeriodName || 'Maintenance'}</td>
                    <td style={{ padding: '0.6rem', fontWeight: 'bold', color: '#059669' }}>₹{p.amount}</td>
                    <td style={{ padding: '0.6rem' }}>{p.paymentMethod}</td>
                    <td style={{ padding: '0.6rem' }}>
                      {formatDateTime(p.paidAt || p.createdAt)}
                    </td>
                    <td style={{ padding: '0.6rem', textAlign: 'right' }}>
                      <Link
                        to={`/receipt/${p._id}`}
                        style={{
                          display: 'inline-block',
                          padding: '0.3rem 0.6rem',
                          background: '#e5e7eb',
                          borderRadius: '4px',
                          color: '#1f2937',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                        }}
                      >
                        📄 View Receipt
                      </Link>
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

export default PaymentHistoryPage;

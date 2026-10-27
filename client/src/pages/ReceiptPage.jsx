import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { formatDateTime } from '../utils/dateFormatter';

const ReceiptPage = () => {
  const { id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/payments/receipt/${id}`);
        setReceipt(res.data?.receipt);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load official receipt.');
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="container" style={{ marginTop: '2rem' }}>Generating official receipt...</div>;
  }

  if (error || !receipt) {
    return (
      <div className="container" style={{ marginTop: '2rem' }}>
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '4px' }}>
          {error || 'Receipt not found.'}
        </div>
        <Link to="/my-bills" style={{ display: 'inline-block', marginTop: '1rem', color: '#2563eb' }}>
          ← Back to My Bills
        </Link>
      </div>
    );
  }

  const bill = receipt.bill;
  const flat = receipt.flat;
  const payer = receipt.payer;

  return (
    <div className="container" style={{ maxWidth: '680px', marginTop: '2rem', marginBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Link to="/my-bills" style={{ color: '#4b5563', fontSize: '0.9rem' }}>
          ← Back to My Bills
        </Link>
        <button
          onClick={handlePrint}
          style={{
            padding: '0.4rem 0.9rem',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.85rem',
            fontWeight: '600',
          }}
        >
          🖨️ Print / Save PDF
        </button>
      </div>

      {/* Official Receipt Card */}
      <div
        className="card"
        style={{
          border: '2px solid #e5e7eb',
          padding: '2rem',
          backgroundColor: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Receipt Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1f2937', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#111827' }}>🏢 FlatFlow Society</h1>
            <p style={{ color: '#4b5563', fontSize: '0.85rem' }}>Central Maintenance & Financial Management</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                display: 'inline-block',
                background: '#d1fae5',
                color: '#065f46',
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                border: '1px solid #a7f3d0',
                marginBottom: '0.35rem',
              }}
            >
              ✓ Verified & Settled
            </span>
            <p style={{ fontSize: '0.85rem', color: '#374151' }}>
              Receipt #: <strong>{receipt.receiptNumber}</strong>
            </p>
          </div>
        </div>

        {/* Transaction Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase' }}>Resident Details</p>
            <p style={{ fontWeight: '600', color: '#111827' }}>{payer?.name}</p>
            <p style={{ color: '#4b5563' }}>{payer?.email}</p>
          </div>

          <div>
            <p style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase' }}>Flat Association</p>
            <p style={{ fontWeight: '600', color: '#111827' }}>
              Wing {flat?.wing} - Flat {flat?.flatNumber}
            </p>
            <p style={{ color: '#4b5563' }}>Floor {flat?.floor}</p>
          </div>

          <div>
            <p style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase' }}>Payment Date & Time</p>
            <p style={{ fontWeight: '500' }}>
              {formatDateTime(receipt.paidAt || receipt.createdAt)}
            </p>
          </div>

          <div>
            <p style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase' }}>Payment Method</p>
            <p style={{ fontWeight: '500' }}>{receipt.paymentMethod}</p>
          </div>
        </div>

        {/* Bill Breakdown Table */}
        <div style={{ marginBottom: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #d1d5db' }}>
                <th style={{ padding: '0.6rem', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '0.6rem', textAlign: 'left' }}>Period / Reference</th>
                <th style={{ padding: '0.6rem', textAlign: 'right' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.6rem' }}>Society Maintenance Charges</td>
                <td style={{ padding: '0.6rem' }}>{bill?.billingPeriodName || 'Monthly Maintenance'}</td>
                <td style={{ padding: '0.6rem', textAlign: 'right' }}>₹{bill?.baseAmount || receipt.amount}</td>
              </tr>
              {bill?.adjustments !== 0 && (
                <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#4b5563' }}>
                  <td style={{ padding: '0.6rem' }}>Adjustments ({bill?.adjustmentReason || 'Adjustments'})</td>
                  <td style={{ padding: '0.6rem' }}>{bill?.billNumber}</td>
                  <td style={{ padding: '0.6rem', textAlign: 'right' }}>₹{bill?.adjustments}</td>
                </tr>
              )}
              <tr style={{ fontWeight: 'bold', fontSize: '1.05rem', background: '#f9fafb' }}>
                <td colSpan="2" style={{ padding: '0.75rem' }}>
                  Total Amount Received
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#059669' }}>
                  ₹{receipt.amount}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Audit & Gateway References */}
        <div style={{ background: '#f9fafb', padding: '0.75rem', borderRadius: '4px', fontSize: '0.8rem', color: '#6b7280' }}>
          <p>
            <strong>Gateway Order ID:</strong> {receipt.orderId}
          </p>
          <p>
            <strong>Gateway Payment Reference:</strong> {receipt.paymentId || 'Captured & Verified'}
          </p>
          <p style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>
            This is an authentic, system-generated electronic receipt issued by FlatFlow. No physical signature required.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPage;

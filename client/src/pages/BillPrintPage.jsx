import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateFormatter';

const BillPrintPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/bills/${id}`);
        setBill(res.data?.bill);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load bill details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const backLink = user?.role === 'admin' ? '/admin/bills' : '/my-bills';
  const backLabel = user?.role === 'admin' ? '← Back to Society Bills' : '← Back to My Bills';

  if (loading) {
    return <div className="container" style={{ marginTop: '2rem' }}>Loading bill details...</div>;
  }

  if (error || !bill) {
    return (
      <div className="container" style={{ marginTop: '2rem' }}>
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '4px' }}>
          {error || 'Bill not found.'}
        </div>
        <Link to={backLink} style={{ display: 'inline-block', marginTop: '1rem', color: '#2563eb' }}>
          {backLabel}
        </Link>
      </div>
    );
  }

  const flat = bill.flat;
  const statusColors = {
    paid: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0', label: '✓ PAID' },
    unpaid: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d', label: 'UNPAID' },
    overdue: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5', label: '⚠ OVERDUE' },
    pending: { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc', label: 'PENDING' },
  };
  const statusStyle = statusColors[bill.status] || statusColors.unpaid;

  return (
    <div className="container" style={{ maxWidth: '720px', marginTop: '2rem', marginBottom: '3rem' }}>
      {/* Navigation & Actions (hidden on print) */}
      <div
        className="no-print"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}
      >
        <Link to={backLink} style={{ color: '#4b5563', fontSize: '0.9rem' }}>
          {backLabel}
        </Link>
        <button
          onClick={handlePrint}
          style={{
            padding: '0.5rem 1rem',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          🖨️ Print / Save PDF
        </button>
      </div>

      {/* Printable Invoice Card */}
      <div
        className="card"
        id="bill-print-area"
        style={{
          border: '2px solid #e5e7eb',
          padding: '2rem',
          backgroundColor: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Invoice Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '2px solid #1f2937',
            paddingBottom: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              🏢 FlatFlow Society
            </h1>
            <p style={{ color: '#4b5563', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              Central Maintenance & Financial Management
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                display: 'inline-block',
                background: statusStyle.bg,
                color: statusStyle.text,
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                border: `1px solid ${statusStyle.border}`,
                marginBottom: '0.35rem',
              }}
            >
              {statusStyle.label}
            </span>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.3rem 0 0', textTransform: 'uppercase' }}>
              Maintenance Invoice
            </p>
          </div>
        </div>

        {/* Bill & Flat Details Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
          }}
        >
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase', margin: '0 0 0.2rem' }}>
              Bill Number
            </p>
            <p style={{ fontWeight: '700', color: '#111827', fontSize: '1rem', margin: 0 }}>{bill.billNumber}</p>
          </div>

          <div>
            <p style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase', margin: '0 0 0.2rem' }}>
              Flat Details
            </p>
            <p style={{ fontWeight: '600', color: '#111827', margin: 0 }}>
              {flat ? `Wing ${flat.wing} - Flat ${flat.flatNumber}` : '—'}
            </p>
            {flat && (
              <p style={{ color: '#4b5563', fontSize: '0.85rem', margin: '0.1rem 0 0' }}>
                Floor {flat.floor} {flat.ownerName ? `| Owner: ${flat.ownerName}` : ''}
              </p>
            )}
          </div>

          <div>
            <p style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase', margin: '0 0 0.2rem' }}>
              Billing Period
            </p>
            <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>
              {bill.billingPeriodName || bill.billingPeriod}
            </p>
          </div>

          <div>
            <p style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase', margin: '0 0 0.2rem' }}>
              Issue Date
            </p>
            <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>{formatDate(bill.issueDate)}</p>
          </div>

          <div>
            <p style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase', margin: '0 0 0.2rem' }}>
              Due Date
            </p>
            <p
              style={{
                fontWeight: '600',
                color: bill.status === 'overdue' ? '#dc2626' : '#111827',
                margin: 0,
              }}
            >
              {formatDate(bill.dueDate)}
            </p>
          </div>

          {bill.paidAt && (
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase', margin: '0 0 0.2rem' }}>
                Paid On
              </p>
              <p style={{ fontWeight: '500', color: '#059669', margin: 0 }}>{formatDate(bill.paidAt)}</p>
            </div>
          )}
        </div>

        {/* Charges Breakdown Table */}
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
                <td style={{ padding: '0.6rem' }}>{bill.billingPeriodName || bill.billingPeriod}</td>
                <td style={{ padding: '0.6rem', textAlign: 'right' }}>₹{bill.baseAmount}</td>
              </tr>
              {bill.adjustments !== 0 && (
                <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#4b5563' }}>
                  <td style={{ padding: '0.6rem' }}>
                    Adjustments ({bill.adjustmentReason || 'Society credit/charge'})
                  </td>
                  <td style={{ padding: '0.6rem' }}>{bill.billNumber}</td>
                  <td
                    style={{
                      padding: '0.6rem',
                      textAlign: 'right',
                      color: bill.adjustments > 0 ? '#dc2626' : '#059669',
                    }}
                  >
                    {bill.adjustments > 0 ? '+' : ''}₹{bill.adjustments}
                  </td>
                </tr>
              )}
              {bill.notes && bill.notes !== 'Monthly Society Maintenance' && (
                <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '0.85rem' }}>
                  <td colSpan="3" style={{ padding: '0.6rem', fontStyle: 'italic' }}>
                    Note: {bill.notes}
                  </td>
                </tr>
              )}
              <tr style={{ fontWeight: 'bold', fontSize: '1.05rem', background: '#f9fafb' }}>
                <td colSpan="2" style={{ padding: '0.75rem' }}>
                  Total Amount {bill.status === 'paid' ? 'Paid' : 'Due'}
                </td>
                <td
                  style={{
                    padding: '0.75rem',
                    textAlign: 'right',
                    color: bill.status === 'paid' ? '#059669' : '#111827',
                    fontSize: '1.15rem',
                  }}
                >
                  ₹{bill.totalAmount}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            background: '#f9fafb',
            padding: '0.75rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            color: '#6b7280',
          }}
        >
          <p style={{ margin: '0 0 0.2rem' }}>
            <strong>Bill Reference:</strong> {bill.billNumber}
          </p>
          {bill.status === 'paid' && bill.payment && (
            <p style={{ margin: '0 0 0.2rem' }}>
              <strong>Payment Reference:</strong> {typeof bill.payment === 'string' ? bill.payment : bill.payment}
            </p>
          )}
          <p style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>
            This is a system-generated maintenance bill issued by FlatFlow Society Management. For disputes or queries,
            please contact the society admin or raise a dispute through the portal.
          </p>
        </div>
      </div>

      {/* Print-specific CSS */}
      <style>{`
        @media print {
          .no-print,
          nav,
          .navbar,
          header {
            display: none !important;
          }
          body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .container {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 1rem !important;
          }
          #bill-print-area {
            border: 1px solid #ccc !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BillPrintPage;

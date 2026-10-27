import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ResidentDashboard = () => {
  const { user } = useAuth();
  const flat = user?.flat;
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/analytics/my-summary');
        setSummary(res.data.summary);
      } catch (err) {
        console.error('Failed to load summary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="container" style={{ marginTop: '1.5rem' }}>
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome back, {user?.name}!</h1>
          <p className="dashboard-subtitle">
            Resident Portal — Maintenance & Billing Management
          </p>
        </div>
        {flat && (
          <div className="flat-badge-display">
            <span className="flat-badge-label">Your Flat</span>
            <span className="flat-badge-value">{flat.wing}-{flat.flatNumber}</span>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="kpi-grid">
          <div className="kpi-card kpi-blue">
            <div className="kpi-icon">📄</div>
            <div className="kpi-content">
              <span className="kpi-value">{summary.totalBills}</span>
              <span className="kpi-label">Total Bills</span>
            </div>
          </div>
          <div className="kpi-card kpi-green">
            <div className="kpi-icon">✅</div>
            <div className="kpi-content">
              <span className="kpi-value">{summary.paidBills}</span>
              <span className="kpi-label">Paid</span>
            </div>
          </div>
          <div className="kpi-card kpi-amber">
            <div className="kpi-icon">⏳</div>
            <div className="kpi-content">
              <span className="kpi-value">{summary.unpaidBills}</span>
              <span className="kpi-label">Unpaid</span>
            </div>
          </div>
          <div className="kpi-card kpi-red">
            <div className="kpi-icon">🚨</div>
            <div className="kpi-content">
              <span className="kpi-value">{summary.overdueBills}</span>
              <span className="kpi-label">Overdue</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Financial Summary Card */}
        {summary && (
          <div className="card analytics-card">
            <h2 className="card-section-title">💰 My Financial Summary</h2>
            <div className="financial-grid">
              <div className="financial-item">
                <span className="financial-label">Total Billed</span>
                <span className="financial-value" style={{ color: '#1f2937' }}>
                  ₹{summary.totalBilled.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="financial-item">
                <span className="financial-label">Total Paid</span>
                <span className="financial-value" style={{ color: '#059669' }}>
                  ₹{summary.totalPaid.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="financial-item">
                <span className="financial-label">Outstanding Balance</span>
                <span className="financial-value" style={{ color: summary.totalOutstanding > 0 ? '#dc2626' : '#059669' }}>
                  ₹{summary.totalOutstanding.toLocaleString('en-IN')}
                </span>
              </div>
              {summary.activeDisputes > 0 && (
                <div className="financial-item">
                  <span className="financial-label">Active Disputes</span>
                  <span className="financial-value" style={{ color: '#f59e0b' }}>
                    {summary.activeDisputes}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Flat Details Card */}
        <div className="card analytics-card">
          <h2 className="card-section-title">🏠 My Flat Details</h2>
          {flat ? (
            <div className="flat-details">
              <div className="flat-detail-row">
                <span className="flat-detail-label">Flat</span>
                <span className="flat-detail-value">Wing {flat.wing} - Flat {flat.flatNumber}</span>
              </div>
              <div className="flat-detail-row">
                <span className="flat-detail-label">Floor</span>
                <span className="flat-detail-value">Floor {flat.floor}</span>
              </div>
              <div className="flat-detail-row">
                <span className="flat-detail-label">Base Maintenance</span>
                <span className="flat-detail-value">₹{flat.maintenanceBaseAmount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flat-detail-row">
                <span className="flat-detail-label">Status</span>
                <span className="badge badge-success">{flat.status || 'Active'}</span>
              </div>
            </div>
          ) : (
            <p style={{ color: '#dc2626' }}>
              No flat currently associated. Please contact society administration.
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card analytics-card">
        <h2 className="card-section-title">🔗 Quick Actions</h2>
        <div className="quick-links">
          <Link to="/my-bills" className="quick-link-btn quick-link-blue">📄 View My Bills & Pay</Link>
          <Link to="/payment-history" className="quick-link-btn quick-link-green">🧾 Payment History</Link>
          <Link to="/disputes" className="quick-link-btn quick-link-amber">⚖️ My Disputes</Link>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;

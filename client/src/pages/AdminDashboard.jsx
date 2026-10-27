import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setAnalytics(res.data.analytics);
      } catch (err) {
        setError('Failed to load analytics data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <div className="analytics-loading">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ marginTop: '2rem' }}>
        <div className="card" style={{ borderLeft: '4px solid #ef4444', color: '#dc2626' }}>{error}</div>
      </div>
    );
  }

  const { overview, billsByStatus, financial, monthlyTrend, disputesByStatus, topDefaulters, recentPayments } = analytics;

  // Find max value for chart bar scaling
  const maxTrendValue = Math.max(
    ...monthlyTrend.map((m) => Math.max(m.billed, m.collected, 1))
  );

  return (
    <div className="container" style={{ marginTop: '1.5rem' }}>
      {/* Header Card */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Society Administration</h1>
          <p className="dashboard-subtitle">
            Welcome, {user?.name} — Here's your society's financial overview
          </p>
        </div>
        <div className="dashboard-date">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Overview KPI Row */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-blue">
          <div className="kpi-icon">🏢</div>
          <div className="kpi-content">
            <span className="kpi-value">{overview.totalFlats}</span>
            <span className="kpi-label">Registered Flats</span>
          </div>
        </div>
        <div className="kpi-card kpi-green">
          <div className="kpi-icon">👥</div>
          <div className="kpi-content">
            <span className="kpi-value">{overview.totalResidents}</span>
            <span className="kpi-label">Active Residents</span>
          </div>
        </div>
        <div className="kpi-card kpi-purple">
          <div className="kpi-icon">📄</div>
          <div className="kpi-content">
            <span className="kpi-value">{overview.totalBills}</span>
            <span className="kpi-label">Total Bills Issued</span>
          </div>
        </div>
        <div className="kpi-card kpi-amber">
          <div className="kpi-icon">📊</div>
          <div className="kpi-content">
            <span className="kpi-value">{financial.collectionRate}%</span>
            <span className="kpi-label">Collection Rate</span>
          </div>
        </div>
      </div>

      {/* Financial Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card analytics-card">
          <h3 className="card-section-title">💰 Financial Summary</h3>
          <div className="financial-grid">
            <div className="financial-item">
              <span className="financial-label">Total Billed</span>
              <span className="financial-value" style={{ color: '#1f2937' }}>₹{financial.totalBilled.toLocaleString('en-IN')}</span>
            </div>
            <div className="financial-item">
              <span className="financial-label">Total Collected</span>
              <span className="financial-value" style={{ color: '#059669' }}>₹{financial.totalCollected.toLocaleString('en-IN')}</span>
            </div>
            <div className="financial-item">
              <span className="financial-label">Outstanding</span>
              <span className="financial-value" style={{ color: '#dc2626' }}>₹{financial.totalOutstanding.toLocaleString('en-IN')}</span>
            </div>
            <div className="financial-item">
              <span className="financial-label">Collection Rate</span>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${financial.collectionRate}%`,
                    backgroundColor: financial.collectionRate >= 80 ? '#059669' : financial.collectionRate >= 50 ? '#f59e0b' : '#dc2626',
                  }}
                ></div>
              </div>
              <span className="financial-percent">{financial.collectionRate}%</span>
            </div>
          </div>
        </div>

        <div className="card analytics-card">
          <h3 className="card-section-title">📋 Bill Status Breakdown</h3>
          <div className="status-breakdown">
            <div className="status-row">
              <span className="status-dot" style={{ backgroundColor: '#059669' }}></span>
              <span className="status-name">Paid</span>
              <span className="status-count">{billsByStatus.paid}</span>
              <div className="status-bar-container">
                <div className="status-bar" style={{ width: `${billsByStatus.total > 0 ? (billsByStatus.paid / billsByStatus.total) * 100 : 0}%`, backgroundColor: '#059669' }}></div>
              </div>
            </div>
            <div className="status-row">
              <span className="status-dot" style={{ backgroundColor: '#f59e0b' }}></span>
              <span className="status-name">Unpaid</span>
              <span className="status-count">{billsByStatus.unpaid}</span>
              <div className="status-bar-container">
                <div className="status-bar" style={{ width: `${billsByStatus.total > 0 ? (billsByStatus.unpaid / billsByStatus.total) * 100 : 0}%`, backgroundColor: '#f59e0b' }}></div>
              </div>
            </div>
            <div className="status-row">
              <span className="status-dot" style={{ backgroundColor: '#dc2626' }}></span>
              <span className="status-name">Overdue</span>
              <span className="status-count">{billsByStatus.overdue}</span>
              <div className="status-bar-container">
                <div className="status-bar" style={{ width: `${billsByStatus.total > 0 ? (billsByStatus.overdue / billsByStatus.total) * 100 : 0}%`, backgroundColor: '#dc2626' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="card analytics-card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="card-section-title">📈 Monthly Collection Trend (Last 6 Months)</h3>
        <div className="chart-container">
          {monthlyTrend.map((m) => (
            <div key={m.period} className="chart-column">
              <div className="chart-bars">
                <div
                  className="chart-bar chart-bar-billed"
                  style={{ height: `${maxTrendValue > 0 ? (m.billed / maxTrendValue) * 180 : 0}px` }}
                  title={`Billed: ₹${m.billed.toLocaleString('en-IN')}`}
                >
                  {m.billed > 0 && <span className="chart-bar-label">₹{(m.billed / 1000).toFixed(0)}k</span>}
                </div>
                <div
                  className="chart-bar chart-bar-collected"
                  style={{ height: `${maxTrendValue > 0 ? (m.collected / maxTrendValue) * 180 : 0}px` }}
                  title={`Collected: ₹${m.collected.toLocaleString('en-IN')}`}
                >
                  {m.collected > 0 && <span className="chart-bar-label">₹{(m.collected / 1000).toFixed(0)}k</span>}
                </div>
              </div>
              <span className="chart-period-label">{m.label}</span>
              <span className="chart-bill-count">{m.paidBills}/{m.totalBills} paid</span>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          <span className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#818cf8' }}></span>Billed</span>
          <span className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#34d399' }}></span>Collected</span>
        </div>
      </div>

      {/* Bottom Row: Defaulters + Disputes + Recent Payments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Top Defaulters */}
        <div className="card analytics-card">
          <h3 className="card-section-title">🚨 Top Overdue Flats</h3>
          {topDefaulters.length === 0 ? (
            <p style={{ color: '#059669', fontWeight: '500', textAlign: 'center', padding: '1rem 0' }}>
              ✅ No overdue bills! All residents are up to date.
            </p>
          ) : (
            <div className="defaulter-list">
              {topDefaulters.map((d, i) => (
                <div key={d.flat} className="defaulter-row">
                  <span className="defaulter-rank">#{i + 1}</span>
                  <span className="defaulter-flat">{d.flat}</span>
                  <span className="defaulter-count">{d.count} bill{d.count > 1 ? 's' : ''}</span>
                  <span className="defaulter-amount">₹{d.totalOverdue.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dispute Summary */}
        <div className="card analytics-card">
          <h3 className="card-section-title">⚖️ Dispute Summary</h3>
          <div className="dispute-stats">
            <div className="dispute-stat">
              <span className="dispute-stat-value" style={{ color: '#dc2626' }}>{disputesByStatus.open}</span>
              <span className="dispute-stat-label">Open</span>
            </div>
            <div className="dispute-stat">
              <span className="dispute-stat-value" style={{ color: '#f59e0b' }}>{disputesByStatus.underReview}</span>
              <span className="dispute-stat-label">Under Review</span>
            </div>
            <div className="dispute-stat">
              <span className="dispute-stat-value" style={{ color: '#059669' }}>{disputesByStatus.resolved}</span>
              <span className="dispute-stat-label">Resolved</span>
            </div>
            <div className="dispute-stat">
              <span className="dispute-stat-value" style={{ color: '#6b7280' }}>{disputesByStatus.rejected}</span>
              <span className="dispute-stat-label">Rejected</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/admin/disputes" className="link-btn">
              View All Disputes →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="card analytics-card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="card-section-title">🧾 Recent Payments</h3>
        {recentPayments.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '1rem 0' }}>
            No payments recorded yet.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Flat</th>
                  <th>Payer</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.receiptNumber}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{p.receiptNumber}</td>
                    <td><span className="badge badge-info">{p.flat}</span></td>
                    <td>{p.payer}</td>
                    <td style={{ fontWeight: '600', color: '#059669' }}>₹{p.amount.toLocaleString('en-IN')}</td>
                    <td>{new Date(p.paidAt).toLocaleDateString('en-IN')}</td>
                    <td style={{ fontSize: '0.85rem', color: '#6b7280' }}>{p.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Navigation */}
      <div className="card analytics-card">
        <h3 className="card-section-title">🔗 Quick Management</h3>
        <div className="quick-links">
          <Link to="/admin/flats" className="quick-link-btn quick-link-blue">🏢 Flat Directory</Link>
          <Link to="/admin/residents" className="quick-link-btn quick-link-green">👥 Residents</Link>
          <Link to="/admin/bills" className="quick-link-btn quick-link-purple">📄 Bills</Link>
          <Link to="/admin/disputes" className="quick-link-btn quick-link-amber">⚖️ Disputes</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

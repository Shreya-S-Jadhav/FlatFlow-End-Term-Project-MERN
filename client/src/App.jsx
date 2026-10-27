import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ResidentDashboard from './pages/ResidentDashboard';
import ResidentBillsPage from './pages/ResidentBillsPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminFlatsPage from './pages/AdminFlatsPage';
import AdminResidentsPage from './pages/AdminResidentsPage';
import AdminBillsPage from './pages/AdminBillsPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import ReceiptPage from './pages/ReceiptPage';
import ResidentDisputesPage from './pages/ResidentDisputesPage';
import AdminDisputesPage from './pages/AdminDisputesPage';

// Root index redirector
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="container" style={{ marginTop: '2rem' }}>Loading FlatFlow...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <div style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<RootRedirect />} />

              {/* Resident Only Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['resident']} />}>
                <Route path="/dashboard" element={<ResidentDashboard />} />
                <Route path="/my-bills" element={<ResidentBillsPage />} />
                <Route path="/payment-history" element={<PaymentHistoryPage />} />
                <Route path="/disputes" element={<ResidentDisputesPage />} />
              </Route>

              {/* Authenticated Routes (Admin or Resident of that flat) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/receipt/:id" element={<ReceiptPage />} />
              </Route>

              {/* Admin Only Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/flats" element={<AdminFlatsPage />} />
                <Route path="/admin/residents" element={<AdminResidentsPage />} />
                <Route path="/admin/bills" element={<AdminBillsPage />} />
                <Route path="/admin/disputes" element={<AdminDisputesPage />} />
              </Route>

              {/* Catch-all 404 */}
              <Route
                path="*"
                element={
                  <div className="container" style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <h2>404 - Page Not Found</h2>
                    <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
                      The page you are looking for does not exist.
                    </p>
                  </div>
                }
              />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

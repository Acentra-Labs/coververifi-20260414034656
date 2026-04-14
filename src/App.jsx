import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ToastProvider } from './components/shared/Toast';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import ConsultantDashboard from './pages/ConsultantDashboard';
import GCDashboard from './pages/GCDashboard';
import ContractorsList from './pages/ContractorsList';
import ContractorDetail from './pages/ContractorDetail';
import SubcontractorsList from './pages/SubcontractorsList';
import SubcontractorDetail from './pages/SubcontractorDetail';
import AddSubcontractor from './pages/AddSubcontractor';
import AgentVerification from './pages/AgentVerification';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === 'consultant' ? '/dashboard' : '/gc-dashboard'} replace />;
  }
  return children;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={user?.role === 'consultant' ? '/dashboard' : '/gc-dashboard'} replace /> : <Login />} />
      <Route path="/verify/:token" element={<AgentVerification />} />
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['consultant']}><ConsultantDashboard /></ProtectedRoute>} />
        <Route path="/gc-dashboard" element={<ProtectedRoute allowedRoles={['gc']}><GCDashboard /></ProtectedRoute>} />
        <Route path="/contractors" element={<ProtectedRoute allowedRoles={['consultant']}><ContractorsList /></ProtectedRoute>} />
        <Route path="/contractors/:id" element={<ProtectedRoute allowedRoles={['consultant']}><ContractorDetail /></ProtectedRoute>} />
        <Route path="/subcontractors" element={<SubcontractorsList />} />
        <Route path="/subcontractors/:id" element={<SubcontractorDetail />} />
        <Route path="/add-subcontractor" element={<AddSubcontractor />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

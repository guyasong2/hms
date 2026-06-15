import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Doctors from './pages/Doctors';
import DoctorDetail from './pages/DoctorDetail';
import Booking from './pages/Booking';
import DashboardWrapper from './pages/DashboardWrapper';
import ProfileSettings from './pages/ProfileSettings';
import AdminDashboard from './pages/AdminDashboard';
import PaymentStatus from './pages/PaymentStatus';
import DoctorSchedule from './pages/DoctorSchedule';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="spinner w-8 h-8" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="doctors/:id" element={<DoctorDetail />} />

        {/* Guest only */}
        <Route path="login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Patient only */}
        <Route path="dashboard" element={<ProtectedRoute roles={['PATIENT', 'DOCTOR']}><DashboardWrapper /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute roles={['PATIENT', 'DOCTOR']}><ProfileSettings /></ProtectedRoute>} />
        <Route path="doctor/schedule" element={<ProtectedRoute roles={['DOCTOR']}><DoctorSchedule /></ProtectedRoute>} />
        <Route path="book/:doctorId" element={<ProtectedRoute roles={['PATIENT']}><Booking /></ProtectedRoute>} />
        <Route path="payment/:status" element={<ProtectedRoute roles={['PATIENT']}><PaymentStatus /></ProtectedRoute>} />

        {/* Admin only */}
        <Route path="admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

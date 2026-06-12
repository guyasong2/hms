import { useAuth } from '../context/AuthContext';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';

export default function DashboardWrapper() {
  const { user } = useAuth();
  
  if (user?.role === 'DOCTOR') {
    return <DoctorDashboard />;
  }
  
  return <PatientDashboard />;
}

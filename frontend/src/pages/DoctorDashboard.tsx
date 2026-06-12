import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import AppointmentCard from '../components/AppointmentCard';
import { Calendar, Clock, DollarSign, Activity } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  
  const { data: appointments, isLoading: apptsLoading, refetch } = useQuery({
    queryKey: ['my-appointments', 'doctor'],
    queryFn: async () => {
      const res = await api.get('/appointments/my');
      return res.data.data;
    }
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['doctor-stats', user?.doctor?.id],
    queryFn: async () => {
      if (!user?.doctor?.id) return null;
      const res = await api.get(`/doctors/${user.doctor.id}/stats`);
      return res.data.data;
    },
    enabled: !!user?.doctor?.id
  });

  const upcoming = appointments?.filter((a: any) => ['CONFIRMED', 'PENDING_PAYMENT'].includes(a.status)) || [];
  const past = appointments?.filter((a: any) => ['COMPLETED', 'CANCELLED', 'PAYMENT_FAILED'].includes(a.status)) || [];

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title text-3xl">Hello, Dr. {user?.doctor?.lastName} 👋</h1>
          <p className="section-subtitle">Welcome to your professional dashboard</p>
        </div>
        <Link to="/profile" className="btn btn-primary shadow-md">
           Manage Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white border-0">
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2 rounded-lg bg-white/20"><Activity size={18}/></div>
             <h3 className="font-medium text-primary-100">Total Visits</h3>
          </div>
          <p className="text-3xl font-bold ml-12">{statsLoading ? '-' : stats?.total}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-green-100 text-green-700"><Calendar size={18}/></div>
            <h3 className="font-medium text-slate-500">Confirmed</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800 ml-12">{statsLoading ? '-' : stats?.confirmed}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-700"><Clock size={18}/></div>
            <h3 className="font-medium text-slate-500">Pending</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800 ml-12">{statsLoading ? '-' : stats?.pending}</p>
        </div>
        <div className="card border-green-100 bg-green-50/30">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-green-200 text-green-800"><DollarSign size={18}/></div>
            <h3 className="font-medium text-slate-600">Revenue</h3>
          </div>
          <p className="text-2xl font-bold text-green-700 ml-12">
            {statsLoading ? '-' : `${stats?.revenue?.toLocaleString()} XAF`}
          </p>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Upcoming Appointments</h2>
        {apptsLoading ? (
          <div className="flex justify-center"><div className="spinner" /></div>
        ) : upcoming.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar size={40} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-700">No upcoming appointments</h3>
            <p className="text-slate-500 mt-1 mb-6">You currently have no upcoming consultations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((appt: any) => (
              <AppointmentCard key={appt.id} appointment={appt} onCancelled={refetch} />
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-6">Past Appointments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
            {past.map((appt: any) => (
              <AppointmentCard key={appt.id} appointment={appt} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

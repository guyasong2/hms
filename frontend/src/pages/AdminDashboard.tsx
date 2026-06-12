import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Users, UserPlus, Calendar as CalIcon, CreditCard, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'doctors'>('overview');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get('/admin/stats')).data.data
  });

  const { data: doctors, refetch: refetchDoctors } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: async () => (await api.get('/admin/doctors')).data.data,
    enabled: activeTab === 'doctors'
  });

  const toggleDoctor = async (id: string) => {
    try {
      await api.patch(`/admin/doctors/${id}/toggle`);
      toast.success('Doctor availability updated');
      refetchDoctors();
    } catch (e) {
      toast.error('Failed to update doctor');
    }
  };

  const verifyDoctor = async (id: string) => {
    try {
      await api.patch(`/admin/doctors/${id}/verify`);
      toast.success('Doctor verified');
      refetchDoctors();
    } catch (e) {
      toast.error('Failed to verify doctor');
    }
  };



  if (statsLoading) return <div className="p-20 flex justify-center"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Activity className="text-primary-600" size={28} /> Admin Console
        </h1>
      </div>

      <div className="flex gap-2 mb-8 border-b border-slate-200">
        {(['overview', 'appointments', 'doctors'] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary-600 text-primary-700 bg-primary-50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Users size={20}/></div>
                <p className="text-slate-500 font-medium">Total Patients</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats?.totalPatients}</p>
            </div>
            <div className="card flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg"><UserPlus size={20}/></div>
                <p className="text-slate-500 font-medium">Total Doctors</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats?.totalDoctors}</p>
            </div>
            <div className="card flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg"><CalIcon size={20}/></div>
                <p className="text-slate-500 font-medium">Appointments</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats?.totalAppointments}</p>
            </div>
            <div className="card flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><CreditCard size={20}/></div>
                <p className="text-slate-500 font-medium">Revenue (XAF)</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats?.totalRevenue?.toLocaleString()}</p>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Appointments</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-500">
                    <th className="p-3 font-medium rounded-tl-lg">Patient</th>
                    <th className="p-3 font-medium">Doctor</th>
                    <th className="p-3 font-medium">Date</th>
                    <th className="p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentAppointments?.map((a: any) => (
                    <tr key={a.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-900">{a.patient.firstName} {a.patient.lastName}</td>
                      <td className="p-3 text-slate-600">Dr. {a.doctor.lastName}</td>
                      <td className="p-3 text-slate-600">{a.slot.date} {a.slot.startTime}</td>
                      <td className="p-3">
                        <span className={`badge ${a.status === 'CONFIRMED' ? 'badge-green' : a.status === 'PENDING_PAYMENT' ? 'badge-yellow' : 'badge-slate'}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'doctors' && (
        <div className="card">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Manage Doctors</h2>
          <div className="grid gap-4">
            {doctors?.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
                    {doc.firstName[0]}{doc.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Dr. {doc.firstName} {doc.lastName}</p>
                    <p className="text-sm text-slate-500">{doc.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`badge ${doc.isVerified ? 'badge-blue' : 'badge-yellow'}`}>
                    {doc.isVerified ? 'Verified' : 'Pending Verification'}
                  </span>
                  <span className={`badge ${doc.isAvailable ? 'badge-green' : 'badge-red'}`}>
                    {doc.isAvailable ? 'Active' : 'Inactive'}
                  </span>
                  {!doc.isVerified && (
                    <button 
                      onClick={() => verifyDoctor(doc.id)}
                      className="btn btn-primary btn-sm"
                    >
                      Verify
                    </button>
                  )}
                  <button 
                    onClick={() => toggleDoctor(doc.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    Toggle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
         <div className="card">
         <h2 className="text-lg font-bold text-slate-800 mb-4">All Appointments (Recent 10 shown in overview)</h2>
         <p className="text-slate-500 text-sm">Please check the overview tab for recent appointments. A full paginated table would go here in production.</p>
       </div>
      )}

    </div>
  );
}

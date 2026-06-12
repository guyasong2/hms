import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ArrowLeft, Briefcase, Star, Clock, Calendar } from 'lucide-react';

interface Slot { id: string; date: string; startTime: string; endTime: string; isBooked: boolean; }
interface Doctor {
  id: string; firstName: string; lastName: string; specialty: string;
  bio?: string; yearsExp: number; fee: number; avatarUrl?: string; isAvailable: boolean;
  timeSlots: Slot[];
}

const groupSlotsByDate = (slots: Slot[]) => {
  return slots.reduce((acc: Record<string, Slot[]>, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});
};

const initials = (first: string, last: string) => `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();

export default function DoctorDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: doctor, isLoading } = useQuery<Doctor>({
    queryKey: ['doctor', id],
    queryFn: async () => (await api.get(`/doctors/${id}`)).data.data,
    enabled: !!id,
  });

  if (isLoading) return (
    <div className="page-container max-w-4xl">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="card space-y-4">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-xl bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-200 rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!doctor) return (
    <div className="page-container text-center py-20">
      <p className="text-slate-500">Doctor not found.</p>
      <Link to="/doctors" className="btn btn-secondary mt-4">Back to doctors</Link>
    </div>
  );

  const grouped = groupSlotsByDate(doctor.timeSlots);

  return (
    <div className="page-container max-w-4xl">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-6 -ml-2">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Doctor Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-20 h-20 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl flex-shrink-0">
                {initials(doctor.firstName, doctor.lastName)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Dr. {doctor.firstName} {doctor.lastName}</h1>
                <span className="badge badge-blue mt-1">{doctor.specialty}</span>
                {doctor.isAvailable
                  ? <span className="badge badge-green ml-2">Available</span>
                  : <span className="badge badge-slate ml-2">Unavailable</span>}
              </div>
            </div>

            {doctor.bio && <p className="text-sm text-slate-600 leading-relaxed mb-4">{doctor.bio}</p>}

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Briefcase size={14} className="text-slate-400" />
                <span>{doctor.yearsExp} years of experience</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span>4.8 average rating (124 reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock size={14} className="text-slate-400" />
                <span>30 min per session</span>
              </div>
            </div>

            <div className="divider" />

            <div>
              <p className="text-xs text-slate-400 mb-1">Consultation fee</p>
              <p className="text-2xl font-bold text-slate-900">
                {doctor.fee.toLocaleString()} <span className="text-sm font-normal text-slate-500">XAF</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">Pay via MTN or Orange MoMo after booking</p>
            </div>

            {!user && (
              <div className="mt-4 p-3 bg-primary-50 border border-primary-100 rounded-lg text-sm text-primary-700">
                <Link to="/register" className="font-semibold hover:underline">Create a free account</Link> to book this doctor.
              </div>
            )}
          </div>
        </div>

        {/* Right: Time slots */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <Calendar size={18} className="text-primary-600" />
              <h2 className="font-semibold text-slate-900">Available Appointments</h2>
            </div>

            {Object.keys(grouped).length === 0 ? (
              <div className="text-center py-10">
                <Calendar size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No available slots</p>
                <p className="text-slate-400 text-sm mt-1">Check back later for new availability</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(grouped).map(([date, slots]) => (
                  <div key={date}>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">
                      {format(new Date(date), 'EEEE, MMMM d')}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {slots.map(slot => (
                        <button
                          key={slot.id}
                          disabled={!user || slot.isBooked}
                          onClick={() => {
                            if (!user) { navigate('/login'); return; }
                            navigate(`/book/${doctor.id}?slotId=${slot.id}`);
                          }}
                          className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all duration-150 text-center
                            ${slot.isBooked
                              ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed line-through'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 active:scale-95'}`}
                        >
                          {slot.startTime}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

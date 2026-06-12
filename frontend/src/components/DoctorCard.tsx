import { Link } from 'react-router-dom';
import { Star, Clock, Briefcase, ArrowRight } from 'lucide-react';

export interface DoctorCardProps {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  bio?: string;
  yearsExp: number;
  fee: number;
  avatarUrl?: string;
  isAvailable: boolean;
}

const SPECIALTY_COLORS: Record<string, string> = {
  'General Medicine': 'bg-blue-100 text-blue-700',
  'Pediatrics': 'bg-green-100 text-green-700',
  'Cardiology': 'bg-red-100 text-red-700',
  'Dermatology': 'bg-purple-100 text-purple-700',
  'Orthopedics': 'bg-orange-100 text-orange-700',
  'Neurology': 'bg-indigo-100 text-indigo-700',
};

const initials = (first: string, last: string) =>
  `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();

export default function DoctorCard({ id, firstName, lastName, specialty, bio, yearsExp, fee, isAvailable }: DoctorCardProps) {
  const colorClass = SPECIALTY_COLORS[specialty] ?? 'bg-slate-100 text-slate-700';
  const avatarColors = ['bg-primary-100 text-primary-700', 'bg-emerald-100 text-emerald-700', 'bg-violet-100 text-violet-700', 'bg-amber-100 text-amber-700'];
  const avatarColor = avatarColors[(firstName.charCodeAt(0) + lastName.charCodeAt(0)) % avatarColors.length];

  return (
    <div className="card flex flex-col gap-4 hover:shadow-card-hover transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-xl ${avatarColor} flex items-center justify-center font-bold text-lg flex-shrink-0`}>
          {initials(firstName, lastName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900 text-base">
              Dr. {firstName} {lastName}
            </h3>
            {isAvailable ? (
              <span className="badge badge-green">Available</span>
            ) : (
              <span className="badge badge-slate">Unavailable</span>
            )}
          </div>
          <span className={`badge ${colorClass} mt-1`}>{specialty}</span>
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{bio}</p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Briefcase size={12} />
          {yearsExp} yrs exp.
        </span>
        <span className="flex items-center gap-1">
          <Star size={12} className="text-amber-400 fill-amber-400" />
          4.8
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          30 min
        </span>
      </div>

      <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Consultation fee</p>
          <p className="font-bold text-slate-900 text-base">
            {fee.toLocaleString()} <span className="text-sm font-normal text-slate-500">XAF</span>
          </p>
        </div>
        <Link to={`/doctors/${id}`} className="btn btn-primary btn-sm gap-1.5 group-hover:gap-2.5 transition-all">
          Book Now <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

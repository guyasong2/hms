import { format } from 'date-fns';
import { Calendar, Clock, User, CreditCard, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Appointment {
  id: string;
  status: string;
  notes?: string;
  doctor: { firstName: string; lastName: string; specialty: string; avatarUrl?: string };
  slot: { date: string; startTime: string; endTime: string };
  payment?: { status: string; provider: string; amount: number } | null;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  PENDING_PAYMENT: { label: 'Awaiting Payment', icon: <AlertCircle size={13} />, className: 'badge-yellow' },
  CONFIRMED:       { label: 'Confirmed',         icon: <CheckCircle2 size={13} />, className: 'badge-green' },
  COMPLETED:       { label: 'Completed',         icon: <CheckCircle2 size={13} />, className: 'badge-slate' },
  CANCELLED:       { label: 'Cancelled',         icon: <XCircle size={13} />,      className: 'badge-red' },
  PAYMENT_FAILED:  { label: 'Payment Failed',    icon: <XCircle size={13} />,      className: 'badge-red' },
};

interface Props {
  appointment: Appointment;
  onCancelled?: () => void;
}

export default function AppointmentCard({ appointment, onCancelled }: Props) {
  const { id, status, doctor, slot, payment } = appointment;
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG['PENDING_PAYMENT'];
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    setCancelling(true);
    try {
      await api.patch(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled');
      onCancelled?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  const formattedDate = (() => {
    try { return format(new Date(slot.date), 'EEE, dd MMM yyyy'); }
    catch { return slot.date; }
  })();

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-primary-700" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">
              Dr. {doctor.firstName} {doctor.lastName}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">{doctor.specialty}</p>
          </div>
        </div>
        <span className={`badge ${config.className} flex items-center gap-1`}>
          {config.icon} {config.label}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar size={14} className="text-slate-400" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock size={14} className="text-slate-400" />
          <span>{slot.startTime} – {slot.endTime}</span>
        </div>
        {payment && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CreditCard size={14} className="text-slate-400" />
            <span>{payment.provider} · {payment.amount.toLocaleString()} XAF</span>
          </div>
        )}
      </div>

      {(status === 'PENDING_PAYMENT' || status === 'CONFIRMED') && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
          {status === 'PENDING_PAYMENT' && (
            <a href={`/book/${id}?pay=1`} className="btn btn-primary btn-sm">Complete Payment</a>
          )}
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="btn btn-secondary btn-sm text-danger border-red-200 hover:bg-red-50"
          >
            {cancelling ? <Loader2 size={12} className="animate-spin" /> : null}
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

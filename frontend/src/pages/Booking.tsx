import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Loader2, Calendar, Clock, CreditCard, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Booking() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const [searchParams] = useSearchParams();
  const slotId = searchParams.get('slotId');
  const existingApptId = searchParams.get('pay'); // if true, we are just paying for an existing appointment
  
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<'MTN' | 'ORANGE'>('MTN');
  const [phone, setPhone] = useState(user?.patient?.phone || '');
  const [notes, setNotes] = useState('');
  
  const { data: doctor } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: async () => (await api.get(`/doctors/${doctorId}`)).data.data,
    enabled: !!doctorId && !existingApptId,
  });

  const { data: appointment } = useQuery({
    queryKey: ['appointment', doctorId], // doctorId is actually appointmentId here if existingApptId is set
    queryFn: async () => (await api.get(`/appointments/${doctorId}`)).data.data,
    enabled: !!existingApptId,
  });

  const targetDoctor = existingApptId ? appointment?.doctor : doctor;
  const targetSlot = existingApptId ? appointment?.slot : doctor?.timeSlots?.find((s: any) => s.id === slotId);

  useEffect(() => {
    if (!existingApptId && doctor && !targetSlot) {
      toast.error('Selected slot is no longer available');
      navigate(`/doctors/${doctorId}`);
    }
  }, [doctor, targetSlot, navigate, doctorId, existingApptId]);

  const handleBookingAndPayment = async () => {
    if (!phone) { toast.error('Please enter your mobile money number'); return; }
    
    setLoading(true);
    try {
      let currentApptId = existingApptId ? doctorId : null;
      
      // Step 1: Create appointment if not exists
      if (!currentApptId) {
        const { data } = await api.post('/appointments', { doctorId, slotId, notes });
        currentApptId = data.data.id;
      }

      // Step 2: Initiate Payment
      const { data: payData } = await api.post('/payments/initiate', {
        appointmentId: currentApptId,
        provider,
        phone
      });

      // Redirect or poll
      if (payData.data.paymentUrl) {
        window.location.href = payData.data.paymentUrl; // Orange money redirects
      } else {
        // MTN MoMo pushes prompt to phone
        navigate(`/payment/pending?appointmentId=${currentApptId}`);
      }
      
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if ((!existingApptId && !doctor) || (existingApptId && !appointment)) return (
    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" size={32} /></div>
  );

  return (
    <div className="page-container max-w-2xl">
      <h1 className="section-title mb-6">{existingApptId ? 'Complete Payment' : 'Confirm Booking'}</h1>
      
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Consultation Details</h2>
        <div className="grid gap-4">
          <div className="flex items-center gap-3 text-slate-700">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
              {targetDoctor?.firstName[0]}{targetDoctor?.lastName[0]}
            </div>
            <div>
              <p className="font-semibold">Dr. {targetDoctor?.firstName} {targetDoctor?.lastName}</p>
              <p className="text-sm text-slate-500">{targetDoctor?.specialty}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-3 rounded-lg">
            <Calendar size={18} className="text-primary-600" />
            <span className="font-medium">{targetSlot?.date}</span>
            <Clock size={18} className="text-primary-600 ml-4" />
            <span className="font-medium">{targetSlot?.startTime} - {targetSlot?.endTime}</span>
          </div>
        </div>
      </div>

      {!existingApptId && (
        <div className="card mb-6">
          <label className="form-label">Notes for Doctor (Optional)</label>
          <textarea
            className="form-input min-h-[100px] resize-none"
            placeholder="Briefly describe your symptoms or reason for visit..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
      )}

      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Payment</h2>
        <div className="flex items-center justify-between mb-6 bg-primary-50 p-4 rounded-lg border border-primary-100">
          <span className="text-slate-700 font-medium">Total Amount:</span>
          <span className="text-xl font-bold text-primary-700">{targetDoctor?.fee.toLocaleString()} XAF</span>
        </div>

        <label className="form-label mb-3">Select Payment Method</label>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setProvider('MTN')}
            className={`p-4 rounded-xl border-2 text-center transition-all ${provider === 'MTN' ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200 hover:border-yellow-200'}`}
          >
            <div className="font-bold text-yellow-500 text-lg mb-1">MTN MoMo</div>
          </button>
          <button
            onClick={() => setProvider('ORANGE')}
            className={`p-4 rounded-xl border-2 text-center transition-all ${provider === 'ORANGE' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-300'}`}
          >
            <div className="font-bold text-orange-600 text-lg mb-1">Orange Money</div>
          </button>
        </div>

        <label className="form-label">Mobile Money Number</label>
        <div className="relative mb-6">
          <input
            type="tel"
            className="form-input pl-10"
            placeholder="Enter phone number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-500 mb-6">
          <ShieldCheck size={16} className="text-green-500 flex-shrink-0" />
          <p>Your payment is secure. A prompt will be sent to your phone to confirm the transaction using your PIN.</p>
        </div>

        <button 
          onClick={handleBookingAndPayment} 
          disabled={loading}
          className="btn btn-primary w-full btn-lg"
        >
          {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
          {loading ? 'Processing...' : `Pay ${targetDoctor?.fee.toLocaleString()} XAF & Confirm`}
        </button>
      </div>
    </div>
  );
}

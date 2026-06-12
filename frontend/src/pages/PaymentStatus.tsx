import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentStatus() {
  const { status } = useParams<{ status: string }>(); // pending, success, cancel
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const [, setPolling] = useState(status === 'pending');
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'success' || status === 'cancel') {
      // For Orange money redirects, we need to verify the callback happened
      if (appointmentId) verifyPayment(appointmentId);
      return;
    }

    if (status === 'pending' && appointmentId) {
      // Poll MTN MoMo status
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const { data } = await api.get(`/payments/verify/${appointmentId}`);
          const pStatus = data.data.status;
          if (pStatus === 'SUCCEEDED') {
            clearInterval(interval);
            setPolling(false);
            toast.success('Payment successful!');
            navigate('/dashboard');
          } else if (pStatus === 'FAILED' || attempts > 20) { // 20 * 3s = 60s timeout
            clearInterval(interval);
            setPolling(false);
            toast.error('Payment failed or timed out.');
            navigate('/dashboard');
          }
        } catch (e) {
          // ignore network errors while polling
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [status, appointmentId, navigate]);

  const verifyPayment = async (id: string) => {
    setVerifying(true);
    try {
      const { data } = await api.get(`/payments/verify/${id}`);
      if (data.data.status === 'SUCCEEDED') {
        toast.success('Payment verified!');
      } else {
        toast.error('Payment not successful');
      }
    } catch (e) {
      toast.error('Error verifying payment');
    } finally {
      setVerifying(false);
      navigate('/dashboard');
    }
  };

  if (status === 'pending' || verifying) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6 relative">
          <Loader2 size={40} className="text-primary-500 animate-spin absolute" />
          <AlertCircle size={20} className="text-primary-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Awaiting Payment Confirmation</h2>
        <p className="text-slate-500 max-w-md">
          Please check your phone and enter your Mobile Money PIN to approve the transaction.
          Do not close this window.
        </p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
         <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Successful</h2>
        <p className="text-slate-500">Redirecting to your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
       <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <XCircle size={40} className="text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Cancelled</h2>
      <button onClick={() => navigate('/dashboard')} className="btn btn-primary mt-4">Return to Dashboard</button>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2, Activity, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: 'PATIENT' as 'PATIENT' | 'DOCTOR',
    email: '', password: '', firstName: '', lastName: '',
    phone: '', gender: '' as '' | 'MALE' | 'FEMALE' | 'OTHER',
    specialty: '', fee: '', yearsExp: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Min 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) e.password = 'Must include uppercase, lowercase, and number';
    if (form.role === 'DOCTOR') {
      if (!form.specialty.trim()) e.specialty = 'Specialty is required';
      if (!form.fee) e.fee = 'Fee is required';
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const passStrength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^a-zA-Z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-500'][passStrength];
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][passStrength];

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        role: form.role,
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        gender: form.gender || undefined,
        specialty: form.specialty || undefined,
        fee: form.fee ? Number(form.fee) : undefined,
        yearsExp: form.yearsExp ? Number(form.yearsExp) : undefined,
      });
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm(f => ({ ...f, [key]: e.target.value }));
      setErrors(ex => ({ ...ex, [key]: '' }));
    },
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center mx-auto mb-4">
            <Activity size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-slate-500 mt-1.5 text-sm">Free to register. Book consultations today.</p>
        </div>

        <div className="card shadow-modal">
          <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${form.role === 'PATIENT' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setForm(f => ({ ...f, role: 'PATIENT' }))}
            >
              Patient
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${form.role === 'DOCTOR' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setForm(f => ({ ...f, role: 'DOCTOR' }))}
            >
              Doctor
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="firstName">First name</label>
                <input id="firstName" type="text" autoComplete="given-name" className={errors.firstName ? 'form-input-error' : 'form-input'} placeholder="John" {...field('firstName')} />
                {errors.firstName && <p className="form-error">{errors.firstName}</p>}
              </div>
              <div>
                <label className="form-label" htmlFor="lastName">Last name</label>
                <input id="lastName" type="text" autoComplete="family-name" className={errors.lastName ? 'form-input-error' : 'form-input'} placeholder="Doe" {...field('lastName')} />
                {errors.lastName && <p className="form-error">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="reg-email">Email address</label>
              <input id="reg-email" type="email" autoComplete="email" className={errors.email ? 'form-input-error' : 'form-input'} placeholder="you@example.com" {...field('email')} />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div>
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="relative">
                <input id="reg-password" type={showPass ? 'text' : 'password'} autoComplete="new-password"
                  className={`${errors.password ? 'form-input-error' : 'form-input'} pr-10`}
                  placeholder="Min 8 characters" {...field('password')} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1 h-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`flex-1 rounded-full transition-colors duration-300 ${i <= passStrength ? strengthColor : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">{strengthLabel}</p>
                </div>
              )}
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="phone">Phone (optional)</label>
                <input id="phone" type="tel" autoComplete="tel" className="form-input" placeholder="237 6X XXX XXXX" {...field('phone')} />
              </div>
              <div>
                <label className="form-label" htmlFor="gender">Gender (optional)</label>
                <select id="gender" className="form-select" {...field('gender')}>
                  <option value="">Select…</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {form.role === 'DOCTOR' && (
              <>
                <div className="divider" />
                <div>
                  <label className="form-label" htmlFor="specialty">Specialty</label>
                  <input id="specialty" type="text" className={errors.specialty ? 'form-input-error' : 'form-input'} placeholder="e.g. Cardiologist" {...field('specialty')} />
                  {errors.specialty && <p className="form-error">{errors.specialty}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label" htmlFor="fee">Consultation Fee (XAF)</label>
                    <input id="fee" type="number" className={errors.fee ? 'form-input-error' : 'form-input'} placeholder="10000" {...field('fee')} />
                    {errors.fee && <p className="form-error">{errors.fee}</p>}
                  </div>
                  <div>
                    <label className="form-label" htmlFor="yearsExp">Years of Experience</label>
                    <input id="yearsExp" type="number" className="form-input" placeholder="5" {...field('yearsExp')} />
                  </div>
                </div>
              </>
            )}

            <div className="flex items-start gap-2.5 text-xs text-slate-500 bg-slate-50 rounded-lg p-3 border border-slate-100">
              <CheckCircle2 size={14} className="text-primary-500 flex-shrink-0 mt-0.5" />
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg">
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

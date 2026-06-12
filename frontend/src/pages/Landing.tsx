import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { ArrowRight, Shield, Clock, Smartphone, Star, Activity } from 'lucide-react';
import DoctorCard, { DoctorCardProps } from '../components/DoctorCard';

const FEATURES = [
  { icon: <Shield size={20} />, title: 'Secure & Private', desc: 'All your health data is encrypted and never shared without your consent.' },
  { icon: <Clock size={20} />, title: 'Book Instantly', desc: 'Choose from hundreds of available slots and confirm your appointment in seconds.' },
  { icon: <Smartphone size={20} />, title: 'Pay with MoMo', desc: 'Pay seamlessly using MTN or Orange Mobile Money — no card needed.' },
  { icon: <Star size={20} />, title: 'Verified Doctors', desc: 'All doctors are licensed, verified, and have proven track records.' },
];

export default function Landing() {
  const { data } = useQuery({
    queryKey: ['featured-doctors'],
    queryFn: async () => {
      const res = await api.get('/doctors');
      return res.data.data.slice(0, 3) as DoctorCardProps[];
    },
  });

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        {/* Glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-400 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6 backdrop-blur-sm">
              <Activity size={14} className="text-primary-300" />
              <span className="text-white/80">Trusted by 10,000+ patients in Cameroon</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-balance">
              Healthcare Made <span className="text-primary-300">Simple</span> and Accessible
            </h1>
            <p className="mt-6 text-lg text-white/70 max-w-xl leading-relaxed">
              Find and consult with top doctors online. Book appointments, pay with MTN or Orange Mobile Money, and take control of your health — all from one platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/doctors" className="btn btn-lg bg-white text-primary-700 hover:bg-primary-50 font-semibold shadow-lg">
                Find a Doctor <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn btn-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm font-medium">
                Create Free Account
              </Link>
            </div>
            <div className="mt-12 flex items-center gap-6 text-sm text-white/60">
              <span className="flex items-center gap-1.5"><Star size={14} className="text-amber-400 fill-amber-400" /> 4.9/5 average rating</span>
              <span>·</span>
              <span>50+ specialist doctors</span>
              <span>·</span>
              <span>Available 6 days a week</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Why Choose HMS?</h2>
            <p className="section-subtitle mt-2 max-w-2xl mx-auto">Everything you need to manage your health, in one place.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card text-center hover:shadow-card-hover transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Doctors ─────────────────────────────────────────────────── */}
      {data && data.length > 0 && (
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="section-title">Featured Doctors</h2>
                <p className="section-subtitle mt-1">Book a consultation with our top specialists</p>
              </div>
              <Link to="/doctors" className="btn btn-secondary btn-sm hidden sm:flex">
                View all <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map((doc) => <DoctorCard key={doc.id} {...doc} />)}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link to="/doctors" className="btn btn-secondary">View all doctors <ArrowRight size={14} /></Link>
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle mt-2">Get a consultation in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create an Account', desc: 'Register as a patient in under 2 minutes with just your email and name.' },
              { step: '02', title: 'Choose a Doctor', desc: 'Browse specialists, check availability, and pick a time slot that works for you.' },
              { step: '03', title: 'Pay & Confirm', desc: 'Pay securely via MTN or Orange MoMo. Get instant confirmation of your booking.' },
            ].map((s) => (
              <div key={s.step} className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-50 border-2 border-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-sm">{s.step}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to take care of your health?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">Join thousands of patients who trust HMS for their healthcare needs.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn btn-lg bg-white text-primary-700 hover:bg-primary-50 font-semibold shadow-lg">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/doctors" className="btn btn-lg bg-primary-500 text-white hover:bg-primary-400 border border-primary-400 font-medium">
              Browse Doctors
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

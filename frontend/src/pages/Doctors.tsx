import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import DoctorCard, { DoctorCardProps } from '../components/DoctorCard';
import { Search, Filter, X } from 'lucide-react';

const SPECIALTIES = [
  'All Specialties',
  'General Medicine',
  'Pediatrics',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Neurology',
  'Gynecology',
  'Ophthalmology',
];

export default function Doctors() {
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['doctors', specialty],
    queryFn: async () => {
      const res = await api.get('/doctors', { params: specialty ? { specialty } : {} });
      return res.data.data as DoctorCardProps[];
    },
  });

  const filtered = data?.filter(d =>
    search
      ? `${d.firstName} ${d.lastName}`.toLowerCase().includes(search.toLowerCase())
      : true,
  ) ?? [];

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="section-title">Find a Doctor</h1>
        <p className="section-subtitle">Browse our verified specialists and book a consultation today</p>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            className="form-input pl-10"
            placeholder="Search by name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400 flex-shrink-0" />
          <select
            className="form-select w-48"
            value={specialty}
            onChange={e => setSpecialty(e.target.value === 'All Specialties' ? '' : e.target.value)}
          >
            {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        {(search || specialty) && (
          <button className="btn btn-ghost text-sm" onClick={() => { setSearch(''); setSpecialty(''); }}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 rounded" />
                <div className="h-3 bg-slate-200 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700 mb-1">No doctors found</h3>
          <p className="text-slate-400 text-sm">Try adjusting your search or filter</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">{filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(doc => <DoctorCard key={doc.id} {...doc} />)}
          </div>
        </>
      )}
    </div>
  );
}

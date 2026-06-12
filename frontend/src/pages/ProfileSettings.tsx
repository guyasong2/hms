import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Save, User, UserCircle } from 'lucide-react';

export default function ProfileSettings() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'DOCTOR';
  
  const [formData, setFormData] = useState<any>({
    firstName: '',
    lastName: '',
    avatarUrl: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    specialty: '',
    bio: '',
    fee: 0,
    yearsExp: 0,
  });

  useEffect(() => {
    if (user) {
      const profile = isDoctor ? user.doctor : user.patient;
      if (profile) {
        const p = profile as any;
        setFormData({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          avatarUrl: p.avatarUrl || '',
          phone: p.phone || '',
          dateOfBirth: p.dateOfBirth || '',
          gender: p.gender || 'MALE',
          specialty: p.specialty || '',
          bio: p.bio || '',
          fee: p.fee || 0,
          yearsExp: p.yearsExp || 0,
        });
      }
    }
  }, [user, isDoctor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      // Clean up empty strings or undefined to not overwrite with invalid data
      const payload: any = {};
      Object.keys(data).forEach(key => {
        if (data[key] !== '' && data[key] !== undefined) {
          payload[key] = data[key];
        }
      });
      const res = await api.put('/auth/me', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      // Force reload to update context, or rely on a context refresh if implemented
      setTimeout(() => window.location.reload(), 1000); 
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  return (
    <div className="page-container max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="section-title text-3xl">Profile Settings</h1>
        <p className="section-subtitle">Manage your personal and professional information</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
            {formData.avatarUrl ? (
              <img src={formData.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-primary-50 shadow-sm" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-slate-50 shadow-sm">
                <UserCircle size={48} />
              </div>
            )}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Profile Image URL</label>
              <input 
                type="url" 
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
                placeholder="https://example.com/my-photo.jpg"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
              <p className="text-xs text-slate-500 mt-1">Provide a public URL to your profile picture.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={16} />
                </div>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={16} />
                </div>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                />
              </div>
            </div>

            {!isDoctor && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                  <input 
                    type="date" 
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </>
            )}

            {isDoctor && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Specialty</label>
                  <input 
                    type="text" 
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Consultation Fee (XAF)</label>
                  <input 
                    type="number" 
                    name="fee"
                    value={formData.fee}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience</label>
                  <input 
                    type="number" 
                    name="yearsExp"
                    value={formData.yearsExp}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Professional Bio</label>
                  <textarea 
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                    placeholder="Tell patients about your background and expertise..."
                  />
                </div>
              </>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              className="btn btn-primary flex items-center gap-2 shadow-md"
              disabled={updateProfileMutation.isPending}
            >
              <Save size={18} />
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

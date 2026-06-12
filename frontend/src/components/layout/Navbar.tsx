import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, LogOut, User, LayoutDashboard, ShieldCheck, Settings } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-slate-600 hover:text-slate-900'}`;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="font-bold text-xl text-slate-900 tracking-tight">
              H<span className="text-primary-600">MS</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            <NavLink to="/doctors" className={navLinkClass}>Find Doctors</NavLink>
          </nav>

          {/* Auth controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'ADMIN' ? (
                  <Link to="/admin" className="btn btn-ghost text-sm gap-1.5">
                    <ShieldCheck size={15} /> Admin
                  </Link>
                ) : (
                  <>
                    <Link to="/dashboard" className="btn btn-ghost text-sm gap-1.5">
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    <Link to="/profile" className="btn btn-ghost text-sm gap-1.5">
                      <Settings size={15} /> Profile
                    </Link>
                  </>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                    {(user.patient?.avatarUrl || user.doctor?.avatarUrl) ? (
                      <img src={user.patient?.avatarUrl || user.doctor?.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={12} className="text-primary-700" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                    {user.patient?.firstName ?? user.doctor?.firstName ?? user.email.split('@')[0]}
                  </span>
                </div>
                <button onClick={handleLogout} className="btn btn-ghost text-sm text-slate-500 hover:text-danger">
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">Log in</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2">
          <NavLink to="/" end className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => setMobileOpen(false)}>Home</NavLink>
          <NavLink to="/doctors" className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => setMobileOpen(false)}>Find Doctors</NavLink>
          <div className="border-t border-slate-100 pt-2 mt-2">
            {user ? (
              <>
                <NavLink to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => setMobileOpen(false)}>
                  {user.role === 'ADMIN' ? 'Admin Panel' : 'My Dashboard'}
                </NavLink>
                {user.role !== 'ADMIN' && (
                  <NavLink to="/profile" className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => setMobileOpen(false)}>
                    Profile Settings
                  </NavLink>
                )}
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-danger hover:bg-red-50">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => setMobileOpen(false)}>Log in</Link>
                <Link to="/register" className="block px-3 py-2 rounded-lg text-sm font-semibold text-primary-600 hover:bg-primary-50" onClick={() => setMobileOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

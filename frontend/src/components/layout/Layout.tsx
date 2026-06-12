import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Activity } from 'lucide-react';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-100 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary-600 flex items-center justify-center">
                <Activity size={14} className="text-white" />
              </div>
              <span className="font-semibold text-slate-800">HMS</span>
              <span className="text-slate-400 text-sm">Hospital Management System</span>
            </div>
            <p className="text-slate-400 text-sm">© {new Date().getFullYear()} HMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

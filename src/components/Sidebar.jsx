import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, Users, LogOut, PieChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Cashback', path: '/cashback', icon: Wallet },
    { name: 'Incentive & Absen', path: '/incentive', icon: Users },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl">
      <div className="p-6 border-b border-slate-700 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
            <PieChart size={24} />
        </div>
        <div>
            <h1 className="text-xl font-bold tracking-wider">GDN3 SCM</h1>
            <p className="text-xs text-slate-400">Project Guerilla</p>
        </div>
      </div>

      <div className="p-4 border-b border-slate-700 bg-slate-800/50">
        <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Logged in as</p>
        <p className="text-sm font-medium truncate">{user?.name}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full ${user?.role === 'super_admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
          {user?.role === 'super_admin' ? 'Super Admin' : `Area: ${user?.area}`}
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
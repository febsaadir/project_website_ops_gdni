import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Wallet, Users, LogOut, Sun, Moon, X, 
  ShieldCheck, Truck, Smartphone // Menambahkan ikon Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import gdnLogo from '../assets/logo.png'; // Pastikan path logo benar

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout } = useAuth();
  
  // State untuk Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Cek local storage saat pertama load
    return localStorage.getItem('theme') === 'dark';
  });

  // Effect untuk apply class 'dark' ke HTML tag
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // --- STRUKTUR MENU BARU (GROUPING) ---
  const menuGroups = [
    {
      title: "Sales Ops",
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Cashback', path: '/cashback', icon: Wallet },
        { name: 'Incentive & Absen', path: '/incentive', icon: Users },
      ]
    },
    // --- MENU BARU SESUAI REQUEST CARAKA ---
    {
      title: "Product",
      items: [
        { name: 'Product Information', path: '/product-info', icon: Smartphone },
      ]
    },
    {
      title: "Supply Chain",
      items: [
        { name: 'Check Coverage', path: '/check-coverage', icon: ShieldCheck },
        { name: 'Tracking Allocation', path: '/tracking-allocation', icon: Truck },
      ]
    }
  ];

  return (
    <>
      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none border-r border-slate-200 dark:border-slate-800 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Sidebar */}
        <div className="h-24 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex-shrink-0">
          <div className="flex items-center gap-3">
             {/* Logo */}
            <img src={gdnLogo} alt="GDN" className="h-10 w-auto" />
            <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white leading-tight">
                  GDNi Ops
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wider">
                  x Supply Chain
                </p>
            </div>
          </div>
          
          {/* Tombol Close (Hanya di Mobile) */}
          <button onClick={toggleSidebar} className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        {/* User Info Card */}
        <div className="p-4 flex-shrink-0">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Current Session</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.name}</p>
                <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-semibold ${user?.role === 'super_admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'}`}>
                {user?.role === 'super_admin' ? 'Administrator Pusat' : `Area: ${user?.area}`}
                </span>
            </div>
        </div>

        {/* Navigation Menu (Scrollable Area) */}
        <nav className="flex-1 px-4 space-y-6 overflow-y-auto py-2 custom-scrollbar">
          {menuGroups.map((group, index) => (
            <div key={index}>
              {/* Group Title */}
              <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {group.title}
              </p>
              
              {/* Group Items */}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => window.innerWidth < 1024 && toggleSidebar()} 
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium text-sm ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 dark:bg-primary dark:shadow-orange-500/20' 
                          : 'text-slate-500 dark:text-slate-400 hover:bg-secondary hover:text-white dark:hover:bg-primary dark:hover:text-white'
                      }`
                    }
                  >
                    <item.icon size={18} className="transition-transform group-hover:scale-110" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3 flex-shrink-0 bg-white dark:bg-slate-900">
          
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center justify-between w-full px-4 py-3 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <span className="text-sm font-medium">Appearance</span>
            {isDarkMode ? <Moon size={18} className="text-yellow-400" /> : <Sun size={18} className="text-orange-400" />}
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
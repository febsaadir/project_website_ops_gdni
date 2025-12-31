import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, User, Lock, Sun, Moon } from 'lucide-react';
// Import Logo (Hanya dipakai di sisi kanan/mobile sekarang)
import gdnLogo from '../assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Logic untuk Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Simulasi delay biar terasa premium
    await new Promise(r => setTimeout(r, 800));

    if (!email.endsWith('@gdn3.com')) {
      setError('Akses ditolak. Gunakan email korporat @gdn3.com');
      setIsSubmitting(false);
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen bg-light-bg dark:bg-dark text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-300">
      
      {/* BAGIAN KIRI: VISUAL & BRANDING (Hanya tampil di Laptop/Desktop) */}
      <div className="hidden lg:flex w-7/12 relative bg-dark overflow-hidden flex-col justify-center p-16">
        {/* Background Gradient & Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        {/* Konten Kiri */}
        <div className="relative z-10 animate-fade-in pl-8">
           {/* Logo Kiri DIHAPUS sesuai request */}
           
           <h1 className="text-7xl font-extrabold text-white leading-tight tracking-tight">
             Data <span className="text-primary">Driven</span> <br /> 
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-blue-300">
               Decisions.
             </span>
           </h1>
           
           <div className="mt-8 border-l-4 border-primary pl-6">
             <h3 className="text-2xl font-bold text-white">GDNi Ops</h3>
             <p className="mt-2 text-slate-400 text-lg max-w-lg leading-relaxed">
               Centralized Control for Supply Chain, IMEI Validation, & Promotor Incentive Tracking.
             </p>
           </div>
        </div>

        <div className="absolute bottom-10 left-24 text-slate-600 text-xs tracking-widest uppercase">
          <p>Restricted Access • Admin Ops Division</p>
        </div>
      </div>

      {/* BAGIAN KANAN: FORM LOGIN */}
      <div className="w-full lg:w-5/12 flex flex-col justify-center items-center p-6 lg:p-16 bg-white dark:bg-dark-surface relative shadow-2xl animate-fade-in transition-colors duration-300">
        
        {/* Tombol Toggle Dark Mode (Pojok Kanan Atas) */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute top-8 right-8 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <img src={gdnLogo} alt="GDN Logo" className="h-16 w-auto mb-6 drop-shadow-md lg:h-20" />
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">GDNi Ops</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Masuk untuk mengakses Dashboard Utama</p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-5">
              
              {/* Input Email */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 ml-1">Email Corporate</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-secondary transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    required 
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all shadow-sm"
                    placeholder="nama@gdn3.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Input Password */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-secondary transition-colors" />
                  </div>
                  <input 
                    type="password" 
                    required 
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all shadow-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-pulse">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}

            {/* Tombol Sign In */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-secondary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Copyright Footer */}
          <div className="mt-8 border-t border-slate-100 dark:border-slate-700 pt-6 text-center">
             <p className="text-xs text-slate-400 dark:text-slate-500">
               &copy; 2026 PT Global Danapati Niaga. All rights reserved.
             </p>
             <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1 uppercase tracking-widest font-semibold">
               Designed & Developed by Febsa Adi Riansyah
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}
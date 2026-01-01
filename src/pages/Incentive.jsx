import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { PROMOTERS, SALES_LOGS } from '../data/incentiveData';
import { 
  Trophy, Users, CheckCircle, XCircle, 
  AlertTriangle, Upload, Search, Save,
  TrendingUp, Award, Filter, BarChart2, ArrowUpDown, DollarSign, Smartphone
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

// --- HELPER: Format Rupiah & Angka ---
const formatIDR = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
const formatCompact = (num) => new Intl.NumberFormat('en', { notation: "compact" }).format(num || 0);

// --- LOGIC: Hitung Tier Insentif ---
const getIncentiveRate = (salesCount) => {
  if (salesCount <= 5) return 15000;
  if (salesCount <= 10) return 20000;
  if (salesCount <= 15) return 25000;
  if (salesCount < 20) return 30000;
  return 40000; // >= 20
};

export default function Incentive() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [searchQuery, setSearchQuery] = useState('');
  
  // State Data
  const [promoterData, setPromoterData] = useState(PROMOTERS);
  const [salesData, setSalesData] = useState(SALES_LOGS);

  // State Filter & Sort Dashboard
  const [dashFilter, setDashFilter] = useState({ year: '2025', area: 'All', product: 'All' });
  const [sortConfig, setSortConfig] = useState('desc'); // 'asc' or 'desc'

  // --- FILTER GLOBAL (Berdasarkan Role) ---
  const filteredPromoters = useMemo(() => {
    let data = promoterData;
    // Filter Area Admin (Keamanan Data)
    if (user?.role === 'area_admin') {
      data = data.filter(p => p.area.toLowerCase().includes(user.area.toLowerCase().replace(/\s/g, '')));
    }
    // Filter Search Box
    if (searchQuery) {
      data = data.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return data;
  }, [promoterData, user, searchQuery]);

  // --- LOGIC DASHBOARD DATA PREPARATION ---
  const dashboardData = useMemo(() => {
    let data = [...filteredPromoters];

    // Filter Area di Dashboard (Khusus Super Admin)
    if (user?.role === 'super_admin' && dashFilter.area !== 'All') {
        data = data.filter(p => p.area.includes(dashFilter.area));
    }

    // Sorting Helper
    const sortMultiplier = sortConfig === 'desc' ? -1 : 1;

    // 1. Top Sales (Qty Global)
    const topSales = [...data].sort((a, b) => (a.salesCount - b.salesCount) * sortMultiplier).slice(0, 10);

    // 2. Top Sales Value (Revenue per Branch)
    const branchMap = data.reduce((acc, curr) => {
        acc[curr.branch] = (acc[curr.branch] || 0) + curr.totalSalesValue;
        return acc;
    }, {});
    const topBranch = Object.keys(branchMap).map(branch => ({
        name: branch,
        value: branchMap[branch]
    })).sort((a, b) => (a.value - b.value) * sortMultiplier).slice(0, 5);

    // 3. Top Apple Seed
    const topSeed = [...data].sort((a, b) => (a.appleSeedLevel - b.appleSeedLevel) * sortMultiplier).slice(0, 10);

    // 4. Top Ops (Avg Score)
    const topOps = [...data].map(p => ({
        ...p,
        opsScore: Math.round((p.attendanceScore + p.dailyActivityScore) / 2)
    })).sort((a, b) => (a.opsScore - b.opsScore) * sortMultiplier).slice(0, 10);

    // 5. Top Product Sales (Specific Product Leaderboard)
    // Filter sales log berdasarkan produk yang dipilih
    let relevantSales = salesData;
    if (dashFilter.product !== 'All') {
        relevantSales = salesData.filter(s => s.type.includes(dashFilter.product) || s.product.includes(dashFilter.product));
    }
    
    // Hitung count per promotor untuk produk tersebut
    const productCounts = relevantSales.reduce((acc, sale) => {
        acc[sale.promoterId] = (acc[sale.promoterId] || 0) + 1;
        return acc;
    }, {});

    // Map kembali ke nama promotor
    const topProductSales = Object.keys(productCounts).map(pid => {
        const promoter = promoterData.find(p => p.id === pid);
        return {
            name: promoter ? promoter.name : 'Unknown',
            count: productCounts[pid]
        };
    }).sort((a, b) => (a.count - b.count) * sortMultiplier).slice(0, 10);

    return { topSales, topBranch, topSeed, topOps, topProductSales };
  }, [filteredPromoters, dashFilter, sortConfig, user, salesData, promoterData]);


  // --- HANDLER: Update Apple Seed ---
  const handleUpdateSeed = (id, newLevel) => {
    if (user?.role !== 'super_admin') return alert("Akses Ditolak: Hanya Tim Caraka.");
    const updated = promoterData.map(p => p.id === id ? { ...p, appleSeedLevel: parseInt(newLevel) } : p);
    setPromoterData(updated);
  };

  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Incentive & Performance</h1>
          <p className="text-slate-500 text-sm mt-1">Monitoring Absensi, Apple Seed, dan Estimasi Insentif Promotor.</p>
        </div>
        
        {/* Search Bar Global */}
        <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari Promotor..." 
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        <nav className="flex space-x-8 min-w-max">
          <button onClick={() => setActiveTab('dashboard')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'dashboard' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
             <BarChart2 size={16} className="inline mr-2 mb-1"/> Dashboard Insight
          </button>
          <button onClick={() => setActiveTab('overview')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
             Apple Seed Level
          </button>
          <button onClick={() => setActiveTab('operational')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'operational' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
             Operational Ops
          </button>
          <button onClick={() => setActiveTab('sales')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'sales' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
             Incentive Calculator
          </button>
        </nav>
      </div>

      {/* ================= TAB: DASHBOARD INSIGHT (NEW) ================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
            
            {/* Dashboard Filters */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-3 items-center">
                    <Filter size={18} className="text-slate-400"/>
                    <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm p-2">
                        <option>2025</option><option>2024</option>
                    </select>
                    {user?.role === 'super_admin' && (
                        <select 
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm p-2"
                            onChange={(e) => setDashFilter({...dashFilter, area: e.target.value})}
                        >
                            <option value="All">All Areas</option>
                            <option value="Jabo">Jabo Areas</option>
                            <option value="Kalimantan">Kalimantan</option>
                            <option value="Jateng">Jateng</option>
                        </select>
                    )}
                    <select 
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm p-2"
                        onChange={(e) => setDashFilter({...dashFilter, product: e.target.value})}
                    >
                        <option value="All">All Products</option>
                        <option value="iPhone 16">iPhone 16</option>
                        <option value="iPhone 15">iPhone 15</option>
                        <option value="iPad">iPad</option>
                        <option value="Watch">Watch</option>
                    </select>
                </div>
                <button 
                    onClick={() => setSortConfig(sortConfig === 'desc' ? 'asc' : 'desc')}
                    className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg"
                >
                    <ArrowUpDown size={16}/> Sort: {sortConfig === 'desc' ? 'Highest First' : 'Lowest First'}
                </button>
            </div>

            {/* Row 1: Sales Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Top 10 Promotor (Sales Qty) */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="text-green-500" size={20}/> Top 10 Promotor (Total Unit)
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dashboardData.topSales} layout="vertical" margin={{left: 20}}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0"/>
                                <XAxis type="number" hide/>
                                <YAxis dataKey="name" type="category" width={100} style={{fontSize: '12px'}} tick={{fill: '#64748b'}}/>
                                <Tooltip contentStyle={{backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border:'none'}}/>
                                <Bar dataKey="salesCount" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} name="Unit Terjual"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Top Product Specific Sales */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Smartphone className="text-purple-500" size={20}/> Top Seller: {dashFilter.product === 'All' ? 'All Products' : dashFilter.product}
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dashboardData.topProductSales} layout="vertical" margin={{left: 20}}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0"/>
                                <XAxis type="number" hide/>
                                <YAxis dataKey="name" type="category" width={100} style={{fontSize: '12px'}} tick={{fill: '#64748b'}}/>
                                <Tooltip contentStyle={{backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border:'none'}}/>
                                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} name="Unit Terjual"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 2: Sales Value & Ops */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Chart 3: Sales Value per Branch */}
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <DollarSign className="text-blue-500" size={20}/> Nilai Penjualan Cabang
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dashboardData.topBranch}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                                <XAxis dataKey="name" style={{fontSize: '10px'}} tick={{fill: '#64748b'}}/>
                                <YAxis hide/>
                                <Tooltip formatter={(val) => formatCompact(val)} contentStyle={{backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border:'none'}}/>
                                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} name="Revenue (Rp)">
                                    {dashboardData.topBranch.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8b5cf6' : '#a78bfa'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 4: Ops Score (Absensi + Activity) */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="text-emerald-500" size={20}/> Top Operational Score
                    </h3>
                    <div className="space-y-4">
                        {dashboardData.topOps.map((p, i) => (
                            <div key={i} className="group">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{p.name}</span>
                                    <span className="font-bold text-emerald-600">{p.opsScore}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full">
                                    <div 
                                        className="h-full rounded-full transition-all duration-500 bg-emerald-500" 
                                        style={{ width: `${p.opsScore}%` }} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 3: Apple Seed List */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Award className="text-yellow-500" size={20}/> Top Promotor (Apple Seed Level)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dashboardData.topSeed.map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs">
                                    {i + 1}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{p.name}</p>
                                    <p className="text-xs text-slate-500">{p.area}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">Lvl {p.appleSeedLevel}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* ================= TAB: OVERVIEW & APPLE SEED (Gamification) ================= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromoters.map((promoter) => (
            <div key={promoter.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Trophy size={100} /></div>
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${promoter.appleSeedLevel >= 10 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : promoter.appleSeedLevel > 0 ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}>{promoter.name.charAt(0)}</div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white truncate max-w-[150px]">{promoter.name}</h3>
                        <p className="text-xs text-slate-500">{promoter.branch}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase">Apple Seed</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">LVL {promoter.appleSeedLevel}</p>
                </div>
              </div>
              <div className="mt-6 relative z-10">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Progress</span>
                    <span className={`font-bold ${promoter.appleSeedStatus === 'On Track' ? 'text-green-500' : 'text-orange-500'}`}>{promoter.appleSeedStatus}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(promoter.appleSeedLevel / 20) * 100}%` }}></div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center relative z-10">
                 <div className="text-xs text-slate-400">Join: {promoter.joinDate}</div>
                 {user?.role === 'super_admin' ? (
                     <div className="flex items-center gap-2">
                        <input type="number" className="w-16 p-1 text-xs border rounded dark:bg-slate-800 dark:border-slate-600 text-center" placeholder="Lvl" onBlur={(e) => handleUpdateSeed(promoter.id, e.target.value)}/>
                        <button className="text-xs bg-slate-800 dark:bg-slate-700 text-white px-2 py-1 rounded hover:bg-slate-700">Update</button>
                     </div>
                 ) : <span className="text-xs italic text-slate-400">View Only</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= TAB: OPERATIONAL OPS ================= */}
      {activeTab === 'operational' && (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div><h3 className="font-bold text-slate-800 dark:text-white">Rekap Harian & Training</h3><p className="text-xs text-slate-500">Input Absensi, Daily Activity, dan Checklist Training.</p></div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50"><Upload size={16}/> Import Excel</button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg"><Save size={16}/> Simpan</button>
                </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-xs">
                        <tr><th className="px-4 py-3 sticky left-0 bg-slate-100 dark:bg-slate-800 z-10">Promotor</th><th className="px-4 py-3">Absensi</th><th className="px-4 py-3 text-center">Activity</th><th className="px-4 py-3 text-center">W1</th><th className="px-4 py-3 text-center">W2</th><th className="px-4 py-3 text-center">W3</th><th className="px-4 py-3 text-center">W4</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                        {filteredPromoters.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3 font-medium text-slate-800 dark:text-white sticky left-0 bg-white dark:bg-slate-900">{p.name}<div className="text-xs text-slate-400 font-normal">{p.branch}</div></td>
                                <td className="px-4 py-3"><div className="flex items-center gap-2"><input type="time" className="p-1 border rounded text-xs dark:bg-slate-800 dark:border-slate-600" defaultValue="09:00" /><span className="text-slate-400">-</span><input type="time" className="p-1 border rounded text-xs dark:bg-slate-800 dark:border-slate-600" defaultValue="18:00" /></div></td>
                                <td className="px-4 py-3 text-center"><div className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${p.dailyActivityScore < 80 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{p.dailyActivityScore}%</div></td>
                                {[1, 2, 3, 4].map(w => <td key={w} className="px-4 py-3 text-center"><input type="checkbox" defaultChecked={p.training[`w${w}`]} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"/></td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* ================= TAB: INCENTIVE CALCULATOR (Fix White Screen) ================= */}
      {activeTab === 'sales' && (
        <div className="space-y-8">
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-400 p-4 rounded-r-xl">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="text-yellow-600 dark:text-yellow-500 mt-0.5" size={20} />
                    <div><h4 className="font-bold text-yellow-800 dark:text-yellow-500 text-sm">Disclaimer Estimasi</h4><p className="text-xs text-yellow-700 dark:text-yellow-600 mt-1">Perhitungan ini hanya <b>estimasi sistem</b>. Validasi final oleh Tim Admin Utama.</p></div>
                </div>
            </div>
            {filteredPromoters.map((promoter) => {
                const rate = getIncentiveRate(promoter.salesCount);
                const salesIncentive = promoter.salesCount * rate;
                // Safe check salesData agar tidak crash
                const mySales = salesData && salesData.length > 0 ? salesData.filter(s => s.promoterId === promoter.id) : [];
                
                return (
                    <div key={promoter.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400"><Users size={24} /></div>
                                <div><h3 className="font-bold text-lg text-slate-800 dark:text-white">{promoter.name}</h3><p className="text-sm text-slate-500">{promoter.dealer}</p></div>
                            </div>
                            <div className="text-right"><p className="text-xs font-bold text-slate-400 uppercase">Est. Total</p><p className="font-mono font-bold text-xl text-green-600">{formatIDR(salesIncentive)}</p></div>
                        </div>
                        <div className="p-6">
                            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3">Detail Penjualan</h4>
                            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-400"><tr><th className="p-2">Invoice</th><th className="p-2">Produk</th><th className="p-2">Status</th><th className="p-2 text-right">Insentif</th></tr></thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {mySales.length > 0 ? mySales.map((sale) => (
                                            <tr key={sale.id}><td className="p-2">{sale.invoice}</td><td className="p-2">{sale.product}</td><td className="p-2">{sale.status}</td><td className="p-2 text-right">{formatIDR(rate)}</td></tr>
                                        )) : <tr><td colSpan={4} className="p-4 text-center text-slate-400">Belum ada data penjualan detil.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      )}
    </div>
  );
}
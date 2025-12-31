import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
// Import Data dari file terpisah (Lebih Rapi)
import { RAW_DATA, TREND_DATA } from '../data/dashboardData';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Filter, DollarSign, Package, Smartphone, TrendingUp, Activity, MapPin, Calendar, ShieldCheck } from 'lucide-react';

// --- HELPER FUNCTIONS ---

// Format Singkat (Rp 22,7 M)
const formatCompactNumber = (number) => {
  if (number >= 1_000_000_000_000) {
    return 'Rp ' + (number / 1_000_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' T';
  }
  if (number >= 1_000_000_000) {
    return 'Rp ' + (number / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' M';
  }
  if (number >= 1_000_000) {
    return 'Rp ' + (number / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' Jt';
  }
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
};

// Format Standard
const formatNumber = (value) => new Intl.NumberFormat('id-ID').format(value);

// Hook untuk mendeteksi Dark Mode
const useThemeDetector = () => {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) setIsDark(true);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);
  return isDark;
};

export default function Dashboard() {
  const { user } = useAuth();
  const isDarkMode = useThemeDetector();

  // Warna Chart Dinamis
  const CHART_COLORS = {
    primary: isDarkMode ? '#f97316' : '#0ea5e9',
    target: isDarkMode ? '#475569' : '#94a3b8',
    text: isDarkMode ? '#cbd5e1' : '#64748b',
    grid: isDarkMode ? '#334155' : '#e2e8f0',
    tooltipBg: isDarkMode ? '#1e293b' : '#ffffff',
    tooltipText: isDarkMode ? '#ffffff' : '#0f172a'
  };

  const PIE_COLORS = ['#ea580c', '#0ea5e9', '#22c55e', '#eab308', '#8b5cf6'];

  // State Filters
  const [selectedArea, setSelectedArea] = useState(user?.role === 'area_admin' ? user.area : 'All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Logic Filtering
  const filteredData = useMemo(() => {
    return RAW_DATA.filter(item => {
      const matchArea = selectedArea === 'All' ? true : item.area === selectedArea;
      const matchCategory = selectedCategory === 'All' ? true : item.category === selectedCategory;
      return matchArea && matchCategory;
    });
  }, [selectedArea, selectedCategory]);

  // Aggregate Data
  const summary = filteredData.reduce((acc, curr) => ({
    revenue: acc.revenue + curr.revenue,
    target: acc.target + curr.target,
    actual: acc.actual + curr.actual,
    active: acc.active + curr.active,
    cermati: acc.cermati + curr.cermati
  }), { revenue: 0, target: 0, actual: 0, active: 0, cermati: 0 });
  
  const achievement = Math.round((summary.actual / summary.target) * 100) || 0;

  // Data Processors for Charts
  const branchData = Object.values(filteredData.reduce((acc, curr) => {
    if (!acc[curr.branch]) acc[curr.branch] = { name: curr.branch, actual: 0, target: 0 };
    acc[curr.branch].actual += curr.actual;
    acc[curr.branch].target += curr.target;
    return acc;
  }, {}));

  const productData = Object.values(filteredData.reduce((acc, curr) => {
    if (!acc[curr.product]) acc[curr.product] = { name: curr.product, quantity: 0, revenue: 0 };
    acc[curr.product].quantity += curr.actual;
    acc[curr.product].revenue += curr.revenue;
    return acc;
  }, {})).sort((a, b) => b.quantity - a.quantity).slice(0, 7);

  const categoryData = Object.values(filteredData.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = { name: curr.category, value: 0 };
    acc[curr.category].value += curr.revenue;
    return acc;
  }, {}));

  const coverageData = [
    { name: 'Active Coverage', value: summary.active },
    { name: 'Not Active', value: summary.actual - summary.active }
  ];

  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      
      {/* HEADER & EXTENDED FILTERS */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Monitoring performance & distribution analysis.</p>
        </div>
        
        {/* REVISI LAYOUT FILTER: Menggunakan Grid agar Sejajar Rapi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full xl:w-auto">
          
          {/* 1. Filter Date */}
          <div className="relative">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-4 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-secondary text-slate-700 dark:text-slate-200 outline-none"
            />
          </div>

           {/* 2. Filter Year */}
           <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-secondary text-slate-700 dark:text-slate-200 appearance-none"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>

          {/* 3. Filter Area */}
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <select 
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              disabled={user?.role !== 'super_admin'}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-secondary disabled:opacity-70 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 appearance-none"
            >
              <option value="All">All Areas</option>
              <option value="Jabo1">Jabo 1</option>
              <option value="Jabo2">Jabo 2</option>
              <option value="Jateng">Jateng</option>
            </select>
          </div>

          {/* 4. Filter Kategori (Sekarang sudah grid, jadi sejajar) */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-secondary text-slate-700 dark:text-slate-200 appearance-none"
            >
              <option value="All">All Categories</option>
              <option value="iPhone">iPhone</option>
              <option value="Mac">Mac</option>
              <option value="iPad">iPad</option>
              <option value="Watch">Watch</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI CARDS (RESPONSIVE GRID 5 COLUMN) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        
        {/* Card 1: Revenue */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-xl text-blue-600 dark:text-blue-400">
              <DollarSign size={20} />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center">
              <TrendingUp size={12} className="mr-1" /> +12%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{formatCompactNumber(summary.revenue)}</h3>
          </div>
        </div>

        {/* Card 2: Achievement */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
           <div className="flex justify-between items-center mb-4">
            <div className={`p-2.5 rounded-xl ${achievement >= 100 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
              <Activity size={20} />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-end">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Sales Achv.</p>
                <span className="text-xs font-bold text-slate-400">{achievement}% / 100%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-secondary dark:bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min(achievement, 100)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 3: Units Sold */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-2.5 rounded-xl text-purple-600 dark:text-purple-400">
              <Package size={20} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Units Sold</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{formatNumber(summary.actual)} <span className="text-sm font-normal text-slate-400">Unit</span></h3>
          </div>
        </div>

        {/* Card 4: Apple Coverage */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Smartphone size={20} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Apple Coverage</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{formatNumber(summary.active)} <span className="text-sm font-normal text-slate-400">Aktif</span></h3>
          </div>
        </div>

        {/* Card 5: Cermati Insurance */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-rose-50 dark:bg-rose-900/20 p-2.5 rounded-xl text-rose-600 dark:text-rose-400">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Asuransi Cermati</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{formatNumber(summary.cermati)} <span className="text-sm font-normal text-slate-400">Klaim</span></h3>
          </div>
        </div>
      </div>

      {/* NEW SECTION: TREND PENJUALAN (Line Chart) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-lg font-bold text-slate-800 dark:text-white">Trend Penjualan ({selectedYear})</h3>
        </div>
        <div className="h-72 w-full">
           <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND_DATA} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.grid} />
                <XAxis dataKey="month" tick={{ fill: CHART_COLORS.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis 
                  tick={{ fill: CHART_COLORS.text, fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(val) => `Rp${val/1000000000}M`}
                />
                <Tooltip 
                  formatter={(val) => formatCompactNumber(val)}
                  contentStyle={{ backgroundColor: CHART_COLORS.tooltipBg, borderColor: CHART_COLORS.grid, borderRadius: '8px', color: CHART_COLORS.tooltipText }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Total Revenue" 
                  stroke={CHART_COLORS.primary} 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: CHART_COLORS.primary, strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* CHARTS ROW: Target vs Actual & Top Product */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART: Target vs Actual (Sub-Area) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Target vs Actual (Sub-Area)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={CHART_COLORS.grid} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: CHART_COLORS.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: CHART_COLORS.tooltipBg, borderColor: CHART_COLORS.grid, borderRadius: '8px', color: CHART_COLORS.tooltipText }}
                  cursor={{ fill: 'transparent' }} 
                />
                <Legend />
                <Bar dataKey="target" name="Target" fill={CHART_COLORS.target} radius={[0, 4, 4, 0]} barSize={20} />
                <Bar dataKey="actual" name="Actual Sales" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART: Top Product Sales */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Top Product Sales (Qty)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.grid} />
                <XAxis dataKey="name" tick={{ fill: CHART_COLORS.text, fontSize: 10 }} interval={0} angle={-15} textAnchor="end" axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value) => formatNumber(value)}
                  contentStyle={{ backgroundColor: CHART_COLORS.tooltipBg, borderColor: CHART_COLORS.grid, borderRadius: '8px', color: CHART_COLORS.tooltipText }}
                />
                <Bar dataKey="quantity" name="Unit Terjual" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* PIE CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART: Revenue by Category */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Revenue by Category</h3>
          <div className="h-64 w-full flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCompactNumber(value)}
                  contentStyle={{ backgroundColor: CHART_COLORS.tooltipBg, borderColor: CHART_COLORS.grid, borderRadius: '8px', color: CHART_COLORS.tooltipText }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART: Activation Coverage */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Activation Coverage</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={coverageData}
                  startAngle={180}
                  endAngle={0}
                  cx="50%"
                  cy="70%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                >
                  <Cell fill="#22c55e" /> {/* Active (Green) */}
                  <Cell fill={isDarkMode ? '#334155' : '#e2e8f0'} /> {/* Inactive (Grey) */}
                </Pie>
                <Tooltip formatter={(val) => formatNumber(val)} 
                  contentStyle={{ backgroundColor: CHART_COLORS.tooltipBg, borderColor: CHART_COLORS.grid, borderRadius: '8px', color: CHART_COLORS.tooltipText }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-2/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {(summary.active / summary.actual * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-slate-400">Activated</p>
            </div>
          </div>
        </div>

        {/* LIST: Top Revenue Generator */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Top Revenue Generator</h3>
          <div className="space-y-4">
             {productData.slice(0, 4).map((item, idx) => (
               <div key={idx} className="group">
                 <div className="flex justify-between text-sm mb-1">
                   <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                   <span className="text-slate-500 text-xs">{formatCompactNumber(item.revenue)}</span>
                 </div>
                 <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full">
                   <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${(item.revenue / productData[0].revenue) * 100}%`,
                        backgroundColor: PIE_COLORS[idx % PIE_COLORS.length]
                      }} 
                   />
                 </div>
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
}
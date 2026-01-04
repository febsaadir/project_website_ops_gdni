import React, { useState, useMemo, useRef } from 'react';
import { 
  Truck, MapPin, Package, ExternalLink, Calendar, 
  LayoutGrid, ArrowRightLeft, FileText, ShoppingCart,
  CheckCircle, XCircle, Clock, AlertTriangle, ChevronDown,
  Upload, FileUp, Save, Search, Download, AlertCircle, Database
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { INTERCOMPANY_DATA, DISTY_LOGS, REQUEST_QUEUE } from '../data/trackingData';

// Format Rupiah / Angka
const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(num);

export default function TrackingAllocation() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State Input Toggle
  const [showManualInput, setShowManualInput] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const fileInputRef = useRef(null);

  // State Data (Bisa dimanipulasi)
  const [requestQueue, setRequestQueue] = useState(REQUEST_QUEUE);
  
  // State Storage Selection (Per Item Request)
  const [selectedStorage, setSelectedStorage] = useState({});

  // --- LOGIC: EXPIRED CHECK (2 HARI) ---
  const checkExpiry = (dateString) => {
    const reqDate = new Date(dateString);
    const now = new Date('2026-01-04T12:00:00'); // Simulasi tanggal hari ini
    const diffTime = Math.abs(now - reqDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays > 2;
  };

  // --- LOGIC: ACTION REQUEST (Checklist/Silang) ---
  const handleRequestAction = (id, action) => {
    const updated = requestQueue.map(item => {
        if (item.id === id) {
            return { ...item, status: action === 'approve' ? 'Ordered' : 'Cancelled' };
        }
        return item;
    });
    setRequestQueue(updated);
  };

  // --- LOGIC: CHANGE STORAGE ---
  const handleStorageChange = (id, storage) => {
      // Logic Approval: NonDisty & Unsellable butuh approval
      const needsApproval = storage === 'NonDisty' || storage === 'Unsellable';
      
      const updated = requestQueue.map(item => {
          if (item.id === id) {
              return { 
                  ...item, 
                  storage: storage,
                  approvalStatus: needsApproval ? 'Waiting Approval' : 'Approved'
              };
          }
          return item;
      });
      setRequestQueue(updated);
  };

  // --- CHART DATA PREPARATION ---
  const chartData = useMemo(() => {
      const planVsReal = INTERCOMPANY_DATA.slice(0, 4).map(d => ({
          name: d.product.substring(0, 15) + '...',
          Plan: d.planQty,
          Fulfilled: d.fulfilledQty
      }));
      return planVsReal;
  }, []);

  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Truck className="text-orange-600" /> Supply Chain Tracking
          </h1>
          <p className="text-slate-500 text-sm mt-1">Intercompany Planning & Disty Allocation Management.</p>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        <nav className="flex space-x-8 min-w-max">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'dashboard' ? 'border-orange-500 text-orange-600 dark:text-orange-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            <LayoutGrid size={16}/> SC Dashboard
          </button>
          
          {/* Menu Intercompany (Hanya Admin Pusat) */}
          {user?.role === 'super_admin' && (
            <button 
                onClick={() => setActiveTab('intercompany')} 
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'intercompany' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
                <ArrowRightLeft size={16}/> Intercompany Plan
            </button>
          )}

          <button 
            onClick={() => setActiveTab('disty')} 
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'disty' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            <Package size={16}/> Disty Allocation
          </button>

          <button 
            onClick={() => setActiveTab('request')} 
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'request' ? 'border-purple-500 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            <ShoppingCart size={16}/> Request Queue
            <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">New</span>
          </button>
        </nav>
      </div>

      {/* ================= TAB 1: DASHBOARD ================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 border-l-4 border-l-blue-500">
                    <p className="text-xs font-bold text-slate-400 uppercase">Intercompany Fulfillment</p>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">92% <span className="text-sm font-normal text-slate-500">On Track</span></h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 border-l-4 border-l-purple-500">
                    <p className="text-xs font-bold text-slate-400 uppercase">Active Requests</p>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">12 <span className="text-sm font-normal text-slate-500">Queue</span></h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 border-l-4 border-l-red-500">
                    <p className="text-xs font-bold text-slate-400 uppercase">Pending Approval (NonDisty)</p>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">3 <span className="text-sm font-normal text-slate-500">Items</span></h3>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Intercompany: Plan vs Fulfilled</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{left: 40}}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0"/>
                                <XAxis type="number" hide/>
                                <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 10, fill: '#64748b'}}/>
                                <Tooltip contentStyle={{backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border:'none'}}/>
                                <Legend />
                                <Bar dataKey="Plan" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={15} />
                                <Bar dataKey="Fulfilled" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={15} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center items-center text-center">
                    <Database size={48} className="text-slate-300 mb-4"/>
                    <h3 className="font-bold text-slate-800 dark:text-white">Storage Utilization</h3>
                    <p className="text-sm text-slate-500 mt-2">Data visualisasi storage WSK/DG belum tersedia.</p>
                </div>
            </div>
        </div>
      )}

      {/* ================= TAB 2: INTERCOMPANY PLAN ================= */}
      {activeTab === 'intercompany' && (
        <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex gap-3">
                <AlertCircle className="text-blue-600 shrink-0" size={20}/>
                <div>
                    <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm">Intercompany Planning Monitor</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">Pastikan fulfillment PO sesuai dengan Plan yang telah dibuat sebelumnya. Prioritaskan barang aging untuk GDNus.</p>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">ID Plan</th>
                            <th className="px-6 py-4">Entitas / Tujuan</th>
                            <th className="px-6 py-4">Produk</th>
                            <th className="px-6 py-4 text-center">Plan Qty</th>
                            <th className="px-6 py-4 text-center">Fulfilled</th>
                            <th className="px-6 py-4">PO Reference</th>
                            <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {INTERCOMPANY_DATA.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4 font-mono font-bold text-blue-600">{item.id}</td>
                                <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">{item.entity}</td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{item.product}</td>
                                <td className="px-6 py-4 text-center font-mono">{item.planQty}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`font-mono font-bold ${item.fulfilledQty >= item.planQty ? 'text-green-600' : 'text-orange-500'}`}>
                                        {item.fulfilledQty}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                    {item.poList.map(po => <div key={po}>{po}</div>)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'Fulfilled' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* ================= TAB 3: DISTY ALLOCATION ================= */}
      {activeTab === 'disty' && (
        <div className="space-y-6">
            
            {/* Input Toggles */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Alokasi Mingguan & Log Pengeluaran</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Catat Sales Order (SO) untuk barang keluar dari Gudang Pusat.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => {setShowManualInput(!showManualInput); setShowBulkUpload(false)}} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors border ${showManualInput ? 'bg-slate-200 dark:bg-slate-700' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100'}`}>
                        <FileText size={16} /> Input SO Manual
                    </button>
                    <button onClick={() => {setShowBulkUpload(!showBulkUpload); setShowManualInput(false)}} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors border ${showBulkUpload ? 'bg-slate-200 dark:bg-slate-700' : 'bg-green-600 text-white hover:bg-green-700 border-transparent'}`}>
                        <Upload size={16} /> Import Bulk Allocation
                    </button>
                </div>
            </div>

            {/* Form Manual (Toggle) */}
            {showManualInput && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl animate-slide-up shadow-lg">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Input Sales Order (Barang Keluar)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <input type="text" placeholder="No. Sales Order (SO)" className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-sm" />
                        <input type="text" placeholder="Cabang Tujuan (Ex: GDN3 Cempaka Mas)" className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-sm" />
                        <input type="text" placeholder="Produk" className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-sm" />
                        <input type="number" placeholder="Qty" className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-sm" />
                        <input type="date" className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-sm" />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setShowManualInput(false)} className="px-4 py-2 text-slate-500 text-sm font-bold">Batal</button>
                        <button className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg">Catat Pengeluaran</button>
                    </div>
                </div>
            )}

            {/* Form Bulk (Toggle) */}
            {showBulkUpload && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 animate-slide-up">
                    <div className="border-2 border-dashed border-green-300 dark:border-green-700 bg-white dark:bg-slate-900 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-green-500" onClick={() => fileInputRef.current.click()}>
                        <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx"/>
                        <FileUp size={32} className="text-green-500 mb-2"/>
                        <p className="font-bold text-slate-700 dark:text-slate-200">Upload File Alokasi Mingguan</p>
                        <p className="text-xs text-slate-400">Klik untuk pilih file excel</p>
                    </div>
                    <div className="mt-4 text-center">
                        <button className="text-green-600 text-xs font-bold hover:underline flex items-center justify-center gap-1">
                            <Download size={14}/> Download Template Alokasi
                        </button>
                    </div>
                </div>
            )}

            {/* Table Log */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Clock size={18}/> Recent Outbound Logs (SO)
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Tgl Keluar</th>
                                <th className="px-6 py-4">No. SO</th>
                                <th className="px-6 py-4">Cabang</th>
                                <th className="px-6 py-4">Produk</th>
                                <th className="px-6 py-4 text-center">Qty</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {DISTY_LOGS.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 text-slate-500">{log.date}</td>
                                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{log.soNumber}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-700 dark:text-slate-200">{log.branch}</p>
                                        <p className="text-xs text-slate-500">{log.area}</p>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{log.product}</td>
                                    <td className="px-6 py-4 text-center font-bold">{log.qty}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${log.status === 'Shipped' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {/* ================= TAB 4: REQUEST QUEUE (COMPLEX LOGIC) ================= */}
      {activeTab === 'request' && (
        <div className="space-y-6">
            <div className="flex gap-2 mb-4 bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                <AlertTriangle className="text-orange-600 shrink-0" size={20}/>
                <div>
                    <p className="text-sm font-bold text-orange-800 dark:text-orange-300">Aturan Request Barang</p>
                    <ul className="text-xs text-orange-700 dark:text-orange-400 list-disc ml-4 mt-1">
                        <li>Request hanya berlaku <b>2 Hari</b>, setelah itu otomatis reset/expired.</li>
                        <li>Pengambilan dari storage <b>NonDisty & Unsellable</b> wajib approval Dean/Pak Maic.</li>
                        <li>Pastikan tidak bentrok dengan alokasi Rifqi & Cakra.</li>
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {requestQueue.map((req) => {
                    const isExpired = checkExpiry(req.requestDate);
                    const requiresApproval = req.approvalStatus === 'Waiting Approval';

                    return (
                        <div key={req.id} className={`bg-white dark:bg-slate-900 rounded-xl border p-5 transition-all ${isExpired ? 'border-red-200 bg-red-50/50 opacity-70' : 'border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md'}`}>
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                
                                {/* Info Request */}
                                <div className="flex gap-4 items-start flex-1">
                                    <div className={`p-3 rounded-full ${isExpired ? 'bg-red-100 text-red-500' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'}`}>
                                        <ShoppingCart size={24}/>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-slate-800 dark:text-white text-lg">{req.requestor}</h4>
                                            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">{req.area}</span>
                                            {isExpired && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded font-bold">EXPIRED</span>}
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">{req.branch}</p>
                                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                            <Clock size={12}/> {req.requestDate}
                                        </p>
                                    </div>
                                </div>

                                {/* Product & Qty */}
                                <div className="flex-1 border-l border-slate-100 dark:border-slate-800 pl-4">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Item Request</p>
                                    <p className="font-bold text-slate-800 dark:text-white text-lg">{req.product}</p>
                                    <p className="text-sm text-blue-600 font-bold">{req.qty} Unit</p>
                                </div>

                                {/* Admin Action & Storage Logic (HANYA ADMIN PUSAT) */}
                                {user?.role === 'super_admin' && !isExpired && (
                                    <div className="flex-1 flex flex-col items-end gap-3">
                                        
                                        {/* Storage Selector */}
                                        <div className="relative group">
                                            <select 
                                                className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold border outline-none cursor-pointer ${
                                                    req.storage === 'WSK' ? 'bg-green-100 text-green-700 border-green-200' :
                                                    req.storage === 'DG' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                    'bg-orange-100 text-orange-700 border-orange-200'
                                                }`}
                                                value={req.storage}
                                                onChange={(e) => handleStorageChange(req.id, e.target.value)}
                                            >
                                                <option value="WSK">Source: WSK (Standard)</option>
                                                <option value="DG">Source: DG</option>
                                                <option value="NonDisty">Source: NonDisty (Need Approval)</option>
                                                <option value="Unsellable">Source: Unsellable (Need Approval)</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-2 top-2 text-current pointer-events-none"/>
                                        </div>

                                        {/* Approval Status Badge */}
                                        {requiresApproval && (
                                            <span className="text-[10px] flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
                                                <AlertTriangle size={10}/> Butuh Approval Dean/Maic
                                            </span>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 mt-1">
                                            {req.status === 'Confirming' && (
                                                <div className="flex items-center gap-1 text-xs text-slate-400 animate-pulse">
                                                    <Clock size={14}/> Checking...
                                                </div>
                                            )}
                                            
                                            {req.status !== 'Ordered' && req.status !== 'Cancelled' ? (
                                                <>
                                                    <button 
                                                        onClick={() => handleRequestAction(req.id, 'cancel')}
                                                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition-colors" title="Tolak / Cancel"
                                                    >
                                                        <XCircle size={18}/>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRequestAction(req.id, 'approve')}
                                                        className="p-2 rounded-lg bg-green-50 text-green-500 hover:bg-green-100 border border-green-200 transition-colors" title="Konfirmasi Order"
                                                    >
                                                        <CheckCircle size={18}/>
                                                    </button>
                                                </>
                                            ) : (
                                                <span className={`font-bold text-sm ${req.status === 'Ordered' ? 'text-green-600' : 'text-red-500'}`}>
                                                    {req.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      )}

    </div>
  );
}
import React, { useState, useMemo, useRef } from 'react';
import { 
  PackageX, Stethoscope, CheckCircle, 
  AlertTriangle, Upload, FileText, Search,
  Truck, Box, Download, RefreshCw, Edit, Video, Save, XCircle, FileSpreadsheet, Paperclip
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { DOA_ENTRIES } from '../data/doaData'; 

// Helper Warna Grade
const getGradeColor = (grade) => {
    switch(grade) {
        case 'A': return 'bg-red-100 text-red-700 border-red-200';
        case 'B': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'C': return 'bg-blue-100 text-blue-700 border-blue-200'; // Revisi: Grade C Biru
        case 'D': return 'bg-green-100 text-green-700 border-green-200'; // Revisi: Grade D Hijau
        default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
};

const getStatusBadge = (status) => {
    if (status.includes('Mitracare')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (status.includes('Clearance')) return 'bg-teal-100 text-teal-700 border-teal-200';
    if (status === 'Inbound') return 'bg-slate-100 text-slate-700 border-slate-200';
    if (status === 'Finished') return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-blue-50 text-blue-600 border-blue-200';
};

export default function DamageDOA() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [doaList, setDoaList] = useState(DOA_ENTRIES || []);
  const [showInputForm, setShowInputForm] = useState(false);
  
  // State Pencarian & Editing
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({}); 

  const fileInputRef = useRef(null);
  const docInputRef = useRef(null); // Ref untuk upload dokumen tambahan

  // --- STATISTIK DASHBOARD (SAFE CHECK) ---
  const stats = useMemo(() => {
      if (!doaList) return { total: 0, mitracare: 0, clearance: 0, finished: 0 };
      return {
          total: doaList.length,
          mitracare: doaList.filter(i => i.status === 'At Mitracare' || i.status === 'Waiting Service').length,
          clearance: doaList.filter(i => i.status === 'In Clearance').length,
          finished: doaList.filter(i => i.storage === 'WSK' || i.storage === 'DG').length,
      };
  }, [doaList]);

  const gradeData = useMemo(() => {
      if (!doaList) return [];
      const grades = { A: 0, B: 0, C: 0, D: 0 };
      doaList.forEach(i => { if(grades[i.grade] !== undefined) grades[i.grade]++ });
      return Object.keys(grades).map(k => ({ name: `Grade ${k}`, value: grades[k] }));
  }, [doaList]);

  // Revisi Warna Chart: A=Merah, B=Kuning(Orange), C=Biru, D=Hijau
  const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#22c55e'];

  // --- FILTERING DATA (SAFE LOWERCASE) ---
  const filteredDoaList = useMemo(() => {
      if (!searchQuery) return doaList;
      const lowerQuery = searchQuery.toLowerCase();
      // Menggunakan Optional Chaining (?.) dan fallback string kosong agar tidak crash
      return doaList.filter(item => 
          (item.imei?.toLowerCase() || '').includes(lowerQuery) ||
          (item.sku?.toLowerCase() || '').includes(lowerQuery) ||
          (item.product?.toLowerCase() || '').includes(lowerQuery) ||
          (item.dealer?.toLowerCase() || '').includes(lowerQuery) ||
          (item.invoice?.toLowerCase() || '').includes(lowerQuery)
      );
  }, [doaList, searchQuery]);

  // --- LOGIC: EDIT & SAVE ---
  const handleEditClick = (item) => {
      setEditingId(item.id);
      setEditForm({ ...item }); 
  };

  const handleSaveClick = () => {
      const updatedList = doaList.map(item => 
          item.id === editingId ? { ...editForm } : item
      );
      setDoaList(updatedList);
      setEditingId(null);
      alert("Data berhasil diperbarui!");
  };

  const handleEditChange = (e) => {
      setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleDocUpload = () => {
      alert("Simulasi: Dokumen PDF/Video berhasil diunggah.");
      // Di sini logika sesungguhnya untuk upload ke server/cloud storage
  };

  // --- LOGIC: GRADING ---
  const handleUpdateGrade = (id, newGrade) => {
      const updated = doaList.map(item => {
          if (item.id === id) {
              let nextStatus = 'Inbound';
              if (['A', 'B'].includes(newGrade)) nextStatus = 'Waiting Service';
              if (['C', 'D'].includes(newGrade)) nextStatus = 'In Clearance';
              return { ...item, grade: newGrade, status: nextStatus, storage: 'Damage D.O.A' };
          }
          return item;
      });
      setDoaList(updated);
  };

  const handleExportExcel = () => {
      alert("Simulasi: Mengunduh Data_Inbound_DOA.xlsx ...");
  };

  // --- LOGIC LAINNYA ---
  const handleSendToService = (id) => {
      if(window.confirm("Kirim unit ini ke Mitracare? Pastikan dokumen lengkap.")) {
          setDoaList(prev => prev.map(item => item.id === id ? { ...item, status: 'At Mitracare' } : item));
      }
  };

  const handleReturnFromService = (id) => {
      setDoaList(prev => prev.map(item => item.id === id ? { ...item, status: 'In Clearance', storage: 'Clearance' } : item));
  };

  const handleFinalAllocation = (id, targetStorage) => { 
      setDoaList(prev => prev.map(item => item.id === id ? { ...item, status: 'Finished', storage: targetStorage } : item));
  };

  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <PackageX className="text-red-600" /> D.O.A Return Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Pengelolaan Barang Retur, Grading, Service Mitracare & Clearance.</p>
        </div>
        
        <div className="flex gap-2">
            <button onClick={() => alert("Fitur Download Template")} className="p-2 text-slate-500 hover:text-green-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors" title="Download Template">
                <Download size={20}/>
            </button>
            <button onClick={() => setShowInputForm(!showInputForm)} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow-lg transition-colors">
                <Upload size={16}/> Input / Import Retur
            </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        <nav className="flex space-x-8 min-w-max">
          <button onClick={() => setActiveTab('dashboard')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'dashboard' ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
            <Box size={16}/> Overview
          </button>
          <button onClick={() => setActiveTab('inbound')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'inbound' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
            <Search size={16}/> Inbound & Grading
          </button>
          <button onClick={() => setActiveTab('service')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'service' ? 'border-purple-500 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
            <Stethoscope size={16}/> Service (Mitracare)
          </button>
          <button onClick={() => setActiveTab('clearance')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'clearance' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
            <CheckCircle size={16}/> Clearance & Allocation
          </button>
        </nav>
      </div>

      {/* ================= TAB 1: DASHBOARD ================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* ... (Statistik) ... */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-xs text-slate-400 uppercase font-bold">Total D.O.A</p>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stats.total} <span className="text-sm font-normal text-slate-500">Unit</span></h3>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/10 p-5 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm">
                    <p className="text-xs text-purple-600 uppercase font-bold">At Mitracare (Grade A/B)</p>
                    <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-300 mt-1">{stats.mitracare} <span className="text-sm font-normal text-purple-500">Unit</span></h3>
                </div>
                <div className="bg-teal-50 dark:bg-teal-900/10 p-5 rounded-xl border border-teal-200 dark:border-teal-800 shadow-sm">
                    <p className="text-xs text-teal-600 uppercase font-bold">In Clearance</p>
                    <h3 className="text-2xl font-bold text-teal-800 dark:text-teal-300 mt-1">{stats.clearance} <span className="text-sm font-normal text-teal-500">Unit</span></h3>
                </div>
                <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-xl border border-green-200 dark:border-green-800 shadow-sm">
                    <p className="text-xs text-green-600 uppercase font-bold">Resolved (WSK/DG)</p>
                    <h3 className="text-2xl font-bold text-green-800 dark:text-green-300 mt-1">{stats.finished} <span className="text-sm font-normal text-green-500">Unit</span></h3>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Distribusi Kerusakan (Grade)</h3>
                    <p className="text-sm text-slate-500 mb-4">Proporsi tingkat kerusakan barang retur.</p>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div>Grade A (Rusak Berat)</span> <span className="font-bold text-red-600">Service</span></div>
                        <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div>Grade B (Fungsi)</span> <span className="font-bold text-orange-600">Service</span></div>
                        <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div>Grade C (Minor)</span> <span className="font-bold text-blue-600">Clearance</span></div>
                        <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div>Grade D (Cosmetic)</span> <span className="font-bold text-green-600">Clearance</span></div>
                    </div>
                </div>
                <div className="h-64 flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={gradeData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {gradeData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      )}

      {/* ================= TAB 2: INBOUND & GRADING (REVISED) ================= */}
      {activeTab === 'inbound' && (
        <div className="space-y-6">
            
            {/* Search & Export Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex-1 w-full relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400 h-4 w-4" />
                    <input 
                        type="text" 
                        placeholder="Cari IMEI, SKU, Dealer, atau Invoice..." 
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button 
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors whitespace-nowrap"
                >
                    <FileSpreadsheet size={16}/> Export Excel
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredDoaList.filter(i => i.status === 'Inbound').map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                        
                        {editingId === item.id ? (
                            // --- EDIT MODE ---
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b pb-2 mb-2 border-slate-100 dark:border-slate-700">
                                    <h4 className="font-bold text-blue-600">Edit Detail Retur: {item.product}</h4>
                                    <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-red-500"><XCircle size={20}/></button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Deskripsi Kerusakan</label>
                                        <textarea 
                                            name="damageType" 
                                            value={editForm.damageType} 
                                            onChange={handleEditChange} 
                                            className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm mt-1 h-24"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Catatan Tambahan</label>
                                        <textarea 
                                            name="description" 
                                            value={editForm.description || ''} 
                                            onChange={handleEditChange} 
                                            className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm mt-1 h-24"
                                            placeholder="Kronologi kerusakan..."
                                        />
                                    </div>
                                </div>

                                {/* Area Upload Dokumen (REVISI POIN 1) */}
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <p className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2"><Paperclip size={14}/> Upload Dokumen Pendukung</p>
                                    <div className="flex gap-4 items-center">
                                        <input type="file" ref={docInputRef} className="hidden" accept=".pdf,.mp4,.jpg" />
                                        <button 
                                            onClick={() => docInputRef.current.click()}
                                            className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-2"
                                        >
                                            <Upload size={14}/> Pilih File (PDF/Video)
                                        </button>
                                        <span className="text-xs text-slate-400 italic">Mendukung: Bukti Approval Email (PDF), Video Unboxing, Foto Fisik.</span>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        {/* Simulasi file yang sudah ada */}
                                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded flex items-center gap-1 border border-red-200"><FileText size={10}/> approval_email.pdf</span>
                                    </div>
                                </div>

                                <button onClick={handleSaveClick} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2">
                                    <Save size={16}/> Simpan Perubahan
                                </button>
                            </div>
                        ) : (
                            // --- VIEW MODE ---
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600">{item.id}</span>
                                            <h4 className="font-bold text-slate-800 dark:text-white">{item.product}</h4>
                                        </div>
                                        <button onClick={() => handleEditClick(item)} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                            <Edit size={12}/> Edit Detail
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 font-mono mb-2">IMEI: {item.imei} | Inv: {item.invoice}</p>
                                    
                                    <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                                        <p><span className="font-bold">Dealer:</span> {item.dealer}</p>
                                        <p><span className="font-bold">Kerusakan:</span> {item.damageType || '-'}</p>
                                        {item.description && <p className="italic text-slate-500 text-xs mt-1">"{item.description}"</p>}
                                    </div>

                                    {/* Dokumen Badge */}
                                    <div className="flex gap-2 mt-3">
                                        {item.documents?.approvalEmail && <span className="flex items-center gap-1 text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100"><FileText size={10}/> Email PDF</span>}
                                        {item.documents?.videoEvidence && <span className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100"><Video size={10}/> Video</span>}
                                    </div>
                                </div>
                                
                                {/* Grading Action */}
                                <div className="flex flex-col gap-2 min-w-[200px] border-l pl-4 border-slate-100 dark:border-slate-800">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Tentukan Grade</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {['A','B','C','D'].map(g => (
                                            <button 
                                                key={g}
                                                onClick={() => handleUpdateGrade(item.id, g)}
                                                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 font-bold text-sm transition-colors"
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {filteredDoaList.filter(i => i.status === 'Inbound').length === 0 && (
                    <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        Tidak ada barang inbound yang cocok dengan pencarian.
                    </div>
                )}
            </div>
        </div>
      )}

      {/* ================= TAB 3 & 4 (SERVICE & CLEARANCE - TETAP SAMA) ================= */}
      {/* (Tidak ada perubahan signifikan disini, tetap gunakan kode yang sama) */}
      
      {activeTab === 'service' && (
        <div className="space-y-6">
             <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-200 dark:border-purple-800 flex items-start gap-3">
                <Stethoscope className="text-purple-600 mt-1" size={20}/>
                <div>
                    <h4 className="font-bold text-purple-800 dark:text-purple-300">Service Center Monitoring (Mitracare)</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-400">Khusus Grade A & B. Kirim unit ke Mitracare dan monitor status pengembalian.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {doaList.filter(i => ['Waiting Service', 'At Mitracare'].includes(i.status)).map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${item.status === 'At Mitracare' ? 'bg-purple-500' : 'bg-orange-500'}`}></div>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pl-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusBadge(item.status)}`}>{item.status}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getGradeColor(item.grade)}`}>Grade {item.grade}</span>
                                </div>
                                <h4 className="font-bold text-slate-800 dark:text-white">{item.product}</h4>
                                <p className="text-xs text-slate-500 font-mono mt-1">IMEI: {item.imei}</p>
                                <p className="text-sm mt-2"><span className="text-slate-400">Kerusakan:</span> {item.damageType}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <p className="text-xs font-bold text-slate-400 uppercase">Estimasi Harga (Ex PPN)</p>
                                <p className="font-mono font-bold text-lg">Rp {item.priceExPPN.toLocaleString('id-ID')}</p>
                                {item.status === 'Waiting Service' ? (
                                    <button onClick={() => handleSendToService(item.id)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-bold shadow-lg">
                                        <Truck size={16}/> Kirim ke Mitracare
                                    </button>
                                ) : (
                                    <button onClick={() => handleReturnFromService(item.id)} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-lg">
                                        <RefreshCw size={16}/> Terima dari Mitracare
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {activeTab === 'clearance' && (
        <div className="space-y-6">
             <div className="bg-teal-50 dark:bg-teal-900/10 p-4 rounded-xl border border-teal-200 dark:border-teal-800 flex items-start gap-3">
                <CheckCircle className="text-teal-600 mt-1" size={20}/>
                <div>
                    <h4 className="font-bold text-teal-800 dark:text-teal-300">Clearance & Final Allocation</h4>
                    <p className="text-sm text-teal-700 dark:text-teal-400">Barang dari Service atau Grade C/D. Tentukan apakah layak jual (WSK) atau Defective (DG).</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doaList.filter(i => i.status === 'In Clearance').map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between h-full">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getGradeColor(item.grade)}`}>Grade {item.grade}</span>
                                <span className="text-xs text-slate-400">{item.id}</span>
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white leading-tight">{item.product}</h4>
                            <p className="text-xs text-slate-500 font-mono mt-1">{item.imei}</p>
                            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300">
                                <p className="font-bold mb-1">Kondisi:</p>
                                {item.damageType}
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <p className="text-center text-xs font-bold text-slate-400 mb-2 uppercase">Pindahkan Ke Storage:</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => handleFinalAllocation(item.id, 'WSK')} className="py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-bold transition-colors">WSK (Sellable)</button>
                                <button onClick={() => handleFinalAllocation(item.id, 'DG')} className="py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg text-sm font-bold transition-colors">DG (Defect)</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

    </div>
  );
}
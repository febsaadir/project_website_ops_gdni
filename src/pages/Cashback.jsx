import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Upload, Search, FileSpreadsheet, CheckCircle, AlertCircle, 
  Download, Clock, XCircle, Calculator, FileUp, 
  PlusCircle, Check, X, RefreshCw, AlertTriangle, Save, Paperclip
} from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Import Auth untuk cek Role
import { MOCK_DB, UPLOAD_HISTORY_DATA } from '../data/cashbackData';
import { PRODUCT_DB } from '../data/productData';

// --- HELPER FUNCTIONS ---
const formatCompactNumber = (number) => {
  if (number >= 1_000_000_000_000) return 'Rp ' + (number / 1_000_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' T';
  if (number >= 1_000_000_000) return 'Rp ' + (number / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' M';
  if (number >= 1_000_000) return 'Rp ' + (number / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' Jt';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
};

const formatIDR = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

export default function Cashback() {
  const { user } = useAuth(); // Ambil data user yang sedang login
  const [activeTab, setActiveTab] = useState('validator');
  
  // State Validator & Bulk
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkResultReady, setBulkResultReady] = useState(false);

  // State Submission & Form Manual
  // Default data diambil dari import, tapi nanti akan dimanipulasi
  const [historyData, setHistoryData] = useState(UPLOAD_HISTORY_DATA); 
  const [showManualInput, setShowManualInput] = useState(false);
  const [showUploadInput, setShowUploadInput] = useState(false);
  
  // State File Upload
  const fileInputRef = useRef(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  // State Form Input Manual
  const [formData, setFormData] = useState({
    imei: '', invoiceDate: '', invoiceNo: '', activeDate: '', cermatiDate: '',
    sku: '', type: '', productName: '', dealerId: '', dealerName: '',
    programName: 'Program Cashback Desember 2025',
    invoicePrice: '', stpPromo: '', supportValue: 0, status: ''
  });

  // --- LOGIC FILTERING DATA BERDASARKAN ROLE & AREA ---
  // Ini adalah otak utama agar Admin Jabo1 hanya melihat Jabo1
  const filteredHistoryData = useMemo(() => {
    if (!user) return [];
    
    // Jika Super Admin (Head Office), lihat semua
    if (user.role === 'super_admin') {
      return historyData;
    }
    
    // Jika Area Admin, filter berdasarkan user.area (Misal: 'Jabo1')
    // Kita asumsikan format di DB 'Jabo 1' (dengan spasi) atau sesuaikan string-nya
    // Disini kita pakai logic includes atau exact match
    return historyData.filter(item => 
      item.area.replace(/\s/g, '').toLowerCase() === user.area.replace(/\s/g, '').toLowerCase() || 
      item.area.toLowerCase().includes(user.area.toLowerCase())
    );
  }, [historyData, user]);

  // --- LOGIC DASHBOARD (MENGGUNAKAN DATA YANG SUDAH DI-FILTER) ---
  const dashboardStats = useMemo(() => {
    return filteredHistoryData.reduce((acc, curr) => {
      acc.totalData += curr.totalData;
      if (curr.status === 'Pending Review') acc.pendingCount += curr.totalData;
      if (curr.status === 'Verified') acc.totalPaid += curr.totalClaim;
      return acc;
    }, { totalData: 0, pendingCount: 0, totalPaid: 0 });
  }, [filteredHistoryData]);

  // --- LOGIC FORM MANUAL (AUTO FILL) ---
  useEffect(() => {
    const upperSKU = formData.sku.toUpperCase();
    if (PRODUCT_DB[upperSKU]) {
      setFormData(prev => ({
        ...prev,
        type: PRODUCT_DB[upperSKU].type,
        productName: PRODUCT_DB[upperSKU].name
      }));
    } else if (formData.sku.length > 5) {
        setFormData(prev => ({ ...prev, type: '', productName: '' }));
    }

    const price = parseFloat(formData.invoicePrice) || 0;
    const stp = parseFloat(formData.stpPromo) || 0;
    setFormData(prev => ({ ...prev, supportValue: price - stp }));

    if (formData.imei.length > 10) {
      const existing = MOCK_DB.find(item => item.imei === formData.imei);
      if (existing) {
          setFormData(prev => ({ 
            ...prev, 
            status: existing.status === 'claimed' ? 'REJECTED (Sudah Klaim)' : 'ELIGIBLE' 
          }));
      } else {
          setFormData(prev => ({ ...prev, status: 'NOT FOUND (Perlu Cek)' }));
      }
    } else {
        setFormData(prev => ({ ...prev, status: '' }));
    }
  }, [formData.sku, formData.invoicePrice, formData.stpPromo, formData.imei]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- INTERACTION HANDLERS ---
  const toggleManual = () => {
      setShowManualInput(!showManualInput);
      setShowUploadInput(false);
  };

  const toggleUpload = () => {
      setShowUploadInput(!showUploadInput);
      setShowManualInput(false);
  };

  const handleFileSelect = (e) => {
      if (e.target.files.length > 0) setSelectedFileName(e.target.files[0].name);
  };

  const handleUploadSubmit = () => {
      if (!selectedFileName) return alert("Pilih file terlebih dahulu!");
      alert(`File ${selectedFileName} berhasil diupload ke database!`);
      setShowUploadInput(false);
      setSelectedFileName('');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    setErrorMsg('');
    setSearchResult(null);
    setTimeout(() => {
      const found = MOCK_DB.find(item => 
        item.imei.toLowerCase() === searchQuery.toLowerCase() || 
        item.invoiceNo.toLowerCase() === searchQuery.toLowerCase()
      );
      if (found) setSearchResult(found);
      else setErrorMsg('Data tidak ditemukan di database Reseller App.');
      setIsSearching(false);
    }, 800);
  };

  const handleBulkUpload = () => {
    setIsBulkProcessing(true);
    setBulkResultReady(false);
    setTimeout(() => {
      setIsBulkProcessing(false);
      setBulkResultReady(true);
    }, 2000);
  };

  const handleUpdateStatus = (id, newStatus) => {
    let reason = '';
    if (newStatus === 'Declined') {
        reason = prompt("Masukkan alasan penolakan (Wajib):");
        if (!reason) return; 
    }
    const currentItem = historyData.find(item => item.id === id);
    if (currentItem.status !== 'Pending Review' && !confirm(`Ubah status dari ${currentItem.status} menjadi ${newStatus}?`)) return;

    const updated = historyData.map(item => 
        item.id === id ? { ...item, status: newStatus, reason: reason } : item
    );
    setHistoryData(updated);
  };

  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Cashback Validation Center</h1>
          <p className="text-slate-500 text-sm mt-1">Validation Hub & Submission Monitoring (Januari 2026)</p>
        </div>
      </div>

      {/* DASHBOARD CARDS (Dynamic based on filtered data) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Data Submission</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
            {dashboardStats.totalData} <span className="text-sm font-normal text-slate-500">Data</span>
          </h3>
          <p className="text-xs text-blue-500 mt-2 font-medium">Periode: Desember 2025</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 border-l-4 border-l-orange-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Verification</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
            {dashboardStats.pendingCount} <span className="text-sm font-normal text-slate-500">Data</span>
          </h3>
          <p className="text-xs text-orange-500 mt-2 font-medium">Menunggu Approval Pusat</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 border-l-4 border-l-emerald-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified & Paid (Est)</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
            {formatCompactNumber(dashboardStats.totalPaid)}
          </h3>
          <p className="text-xs text-emerald-500 mt-2 font-medium">Total Realisasi Bulan Ini</p>
        </div>
      </div>

      {/* TABS & CONTENT */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[600px]">
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => setActiveTab('validator')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'validator' ? 'bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
            <CheckCircle size={18} /> IMEI Validator & Check
          </button>
          <button onClick={() => setActiveTab('submission')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'submission' ? 'bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
            <Upload size={18} /> Area Submission Center
          </button>
        </div>

        <div className="p-6 md:p-8">
          
          {/* --- TAB 1: VALIDATOR --- */}
          {activeTab === 'validator' && (
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Kiri: Manual Search */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                   <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><Search size={20} className="text-blue-500"/> Pengecekan Manual</h2>
                   <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Input IMEI/SN untuk melihat detail lengkap transaksi.</p>
                </div>
                <form onSubmit={handleSearch} className="relative">
                  <input type="text" placeholder="Contoh: 356789012345678" className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white font-mono" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <button type="submit" disabled={isSearching || !searchQuery} className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"><Search size={18} /></button>
                </form>

                {/* Result Manual */}
                <div className="min-h-[300px] border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 p-4">
                    {isSearching && <p className="text-center text-slate-500 mt-10 animate-pulse">Sedang mencari data...</p>}
                    {errorMsg && <div className="text-center text-red-500 mt-10 px-4"><XCircle size={32} className="mx-auto mb-2" /><p className="font-bold">{errorMsg}</p></div>}
                    {searchResult && (
                         <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in">
                            <div className={`p-3 px-5 flex justify-between items-center ${searchResult.status === 'available' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                <span className="font-bold text-sm tracking-wide">STATUS KLAIM</span>
                                <span className="font-bold flex items-center gap-2">{searchResult.status === 'available' ? 'AVAILABLE' : 'CLAIMED'}</span>
                            </div>
                            <div className="p-5 space-y-6 text-sm">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 pb-1 border-b border-slate-100 dark:border-slate-700">Informasi Produk & Dealer</h4>
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                        <div><p className="text-slate-500">IMEI / SN</p><p className="font-mono font-medium text-slate-800 dark:text-white">{searchResult.imei}</p></div>
                                        <div><p className="text-slate-500">Tipe Produk</p><p className="font-medium text-slate-800 dark:text-white">{searchResult.type}</p></div>
                                        <div className="col-span-2"><p className="text-slate-500">Nama Produk</p><p className="font-medium text-slate-800 dark:text-white">{searchResult.productName}</p></div>
                                        <div className="col-span-2"><p className="text-slate-500">Dealer & Cabang</p><p className="font-medium text-slate-800 dark:text-white">{searchResult.dealerName} ({searchResult.dealerId}) <br/> <span className="text-xs text-slate-400">{searchResult.branch}</span></p></div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex justify-between pt-2">
                                        <span className="font-bold text-slate-800 dark:text-white">NILAI SUPPORT</span>
                                        <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{formatIDR(searchResult.invoicePrice - searchResult.stpPromo)}</span>
                                    </div>
                                </div>
                            </div>
                         </div>
                    )}
                </div>
              </div>

              {/* Kanan: Bulk Tools */}
              <div className="lg:col-span-5 space-y-6 border-l border-slate-200 dark:border-slate-800 lg:pl-8">
                <div>
                   <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><FileSpreadsheet size={20} className="text-green-600"/> Bulk Checker</h2>
                   <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Upload Excel untuk cek ratusan IMEI sekaligus.</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                    <div 
                        className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group"
                        onClick={() => alert("Mendownload Template Check IMEI")}
                        title="Klik untuk download template"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg"><FileSpreadsheet size={24} className="text-green-600"/></div>
                            <div>
                                <p className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">Template Check IMEI</p>
                                <p className="text-xs text-slate-400">Klik box ini untuk download template</p>
                            </div>
                        </div>
                        <Download size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors"/>
                    </div>

                    {!isBulkProcessing && !bulkResultReady && (
                        <div onClick={handleBulkUpload} className="border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10 rounded-xl p-8 text-center cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors group">
                            <FileUp size={32} className="mx-auto text-blue-500 mb-2 group-hover:scale-110 transition-transform"/>
                            <p className="font-bold text-blue-700 dark:text-blue-300">Upload Data Excel</p>
                            <p className="text-xs text-slate-400 mt-1">Klik untuk import file</p>
                        </div>
                    )}

                    {isBulkProcessing && (
                         <div className="p-8 text-center">
                            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="font-bold text-slate-700 dark:text-slate-200">Processing Data...</p>
                         </div>
                    )}

                    {bulkResultReady && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center animate-fade-in">
                            <CheckCircle size={32} className="mx-auto text-green-600 mb-2"/>
                            <p className="font-bold text-green-800 dark:text-green-300">Validasi Selesai!</p>
                            <button className="w-full py-2 mt-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 shadow-lg"><Download size={16}/> Download Result.xlsx</button>
                            <button onClick={() => setBulkResultReady(false)} className="mt-2 text-xs text-slate-400 hover:text-slate-600 underline">Check file lain</button>
                        </div>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 2: SUBMISSION --- */}
          {activeTab === 'submission' && (
             <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Submission Periode: Januari 2026</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">Pastikan data rekap lengkap sebelum diupload.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={toggleManual} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors border ${showManualInput ? 'bg-slate-200 dark:bg-slate-700' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100'}`}>
                            <PlusCircle size={16} /> {showManualInput ? 'Tutup Manual' : 'Input Manual'}
                        </button>
                        <button onClick={toggleUpload} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors border ${showUploadInput ? 'bg-slate-200 dark:bg-slate-700' : 'bg-blue-600 text-white hover:bg-blue-700 border-transparent'}`}>
                            <Upload size={16} /> {showUploadInput ? 'Tutup Upload' : 'Upload Rekap'}
                        </button>
                    </div>
                </div>

                {/* FORM INPUT MANUAL */}
                {showManualInput && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl animate-fade-in shadow-lg">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><PlusCircle size={20} className="text-blue-500"/> Form Pengajuan Cashback</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Program</label>
                                <select className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-sm font-bold" value={formData.programName} onChange={handleInputChange} name="programName">
                                    <option>Program Cashback Desember 2025</option>
                                    <option>Program Cashback Januari 2026</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">IMEI / SN</label>
                                <input type="text" name="imei" value={formData.imei} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none uppercase" placeholder="Scan IMEI..." />
                                {formData.status && <p className={`text-xs mt-1 font-bold ${formData.status.includes('REJECTED') ? 'text-red-500' : formData.status.includes('NOT') ? 'text-orange-500' : 'text-green-500'}`}>{formData.status}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">SKU Produk</label>
                                <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500" placeholder="Ketik SKU..." />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Produk (Auto)</label>
                                <input type="text" readOnly value={formData.productName} className="w-full p-2.5 border rounded-lg bg-slate-100 dark:bg-slate-700/50 dark:border-slate-700 text-sm text-slate-500 cursor-not-allowed" placeholder="Otomatis terisi saat SKU diketik..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Tipe Produk (Auto)</label>
                                <input type="text" readOnly value={formData.type} className="w-full p-2.5 border rounded-lg bg-slate-100 dark:bg-slate-700/50 dark:border-slate-700 text-sm text-slate-500 cursor-not-allowed" />
                            </div>
                            
                            {/* REVISI POINT 3: PEMISAHAN DEALER ID DAN NAMA DEALER */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Dealer ID</label>
                                <input type="text" name="dealerId" value={formData.dealerId} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-sm uppercase" placeholder="Contoh: DLR-001" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Dealer</label>
                                <input type="text" name="dealerName" value={formData.dealerName} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-sm" placeholder="Contoh: Erafone Megastore Depok" />
                            </div>
                            <div className="md:col-span-2"></div> {/* Spacer */}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal Invoice</label>
                                <input type="date" name="invoiceDate" value={formData.invoiceDate} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">No. Invoice</label>
                                <input type="text" name="invoiceNo" value={formData.invoiceNo} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-sm" placeholder="INV/..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Aktif Coverage</label>
                                <input type="date" name="activeDate" value={formData.activeDate} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Aktif Cermati</label>
                                <input type="date" name="cermatiDate" value={formData.cermatiDate} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-sm" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Harga Invoice (Rp)</label>
                                <input type="number" name="invoicePrice" value={formData.invoicePrice} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-sm font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">STP Promo (Rp)</label>
                                <input type="number" name="stpPromo" value={formData.stpPromo} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-sm text-red-500 font-bold" />
                            </div>
                            <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800 flex flex-col justify-center px-4">
                                <label className="block text-xs font-bold text-blue-500 mb-1">Estimasi Nilai Support</label>
                                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{formatIDR(formData.supportValue)}</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <button onClick={() => setShowManualInput(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-bold">Batal</button>
                            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-lg"><Save size={16}/> Simpan Data</button>
                        </div>
                    </div>
                )}

                {/* FORM UPLOAD */}
                {showUploadInput && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 animate-fade-in">
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".xlsx, .xls, .csv" />
                        <div 
                            className="border-2 border-dashed border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 transition-colors"
                            onClick={() => fileInputRef.current.click()}
                        >
                            <CloudUploadIcon />
                            <p className="mt-4 font-bold text-slate-700 dark:text-slate-200">{selectedFileName ? selectedFileName : "Pilih File Rekap Excel"}</p>
                            <p className="text-xs text-slate-400">Maksimal 5MB (.xlsx)</p>
                            <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 pointer-events-none">{selectedFileName ? "Ganti File" : "Pilih File dari Komputer"}</button>
                        </div>
                        {selectedFileName && (
                            <div className="mt-4 flex justify-end">
                                <button onClick={handleUploadSubmit} className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg"><Upload size={16}/> Upload ke Database</button>
                            </div>
                        )}
                        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <FileSpreadsheet size={16}/><span>Belum punya format?</span>
                            <button className="text-blue-600 font-bold hover:underline" onClick={() => alert("Download template...")}>Download Template Rekap</button>
                        </div>
                    </div>
                )}

                {/* TABLE HISTORY (FILTERED BY ROLE) */}
                <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
                            <tr>
                                <th className="px-6 py-4">Periode</th>
                                <th className="px-6 py-4">Area</th>
                                <th className="px-6 py-4">File / Data</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Est. Claim</th>
                                {/* REVISI POINT 1: HIDE ADMIN ACTION IF AREA ADMIN */}
                                {user?.role === 'super_admin' && <th className="px-6 py-4 text-center">Admin Action</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-900">
                            {filteredHistoryData.length > 0 ? (
                                filteredHistoryData.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 text-slate-500">{item.period}</td>
                                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">{item.area}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                            <FileSpreadsheet size={16} className="text-green-600" /> <span>{item.file}</span>
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">{item.totalData} Data Rows</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'Verified' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : item.status === 'Declined' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>{item.status}</span>
                                        {item.reason && <p className="text-xs text-red-500 mt-1 italic">"{item.reason}"</p>}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">{formatIDR(item.totalClaim)}</td>
                                    
                                    {/* REVISI POINT 1: HIDE ADMIN ACTION IF AREA ADMIN */}
                                    {user?.role === 'super_admin' && (
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleUpdateStatus(item.id, 'Pending Review')} className="p-1.5 hover:bg-orange-100 text-orange-500 rounded"><RefreshCw size={16}/></button>
                                                <button onClick={() => handleUpdateStatus(item.id, 'Verified')} className="p-1.5 hover:bg-green-100 text-green-500 rounded"><Check size={16}/></button>
                                                <button onClick={() => handleUpdateStatus(item.id, 'Declined')} className="p-1.5 hover:bg-red-100 text-red-500 rounded"><X size={16}/></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic">Tidak ada data submission untuk area ini.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Komponen kecil untuk icon upload (Cloud)
function CloudUploadIcon() {
    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full mb-2 group-hover:scale-110 transition-transform">
            <Upload size={32} className="text-blue-500" />
        </div>
    )
}
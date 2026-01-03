import React, { useState } from 'react';
import { 
  Search, ShieldCheck, CheckCircle, AlertCircle, Loader2, 
  FileSpreadsheet, Download, FileUp, Database, Globe, Smartphone, XCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { COVERAGE_DB } from '../data/coverageData';

export default function CheckCoverage() {
  const { user } = useAuth();
  const [imei, setImei] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // --- PROTEKSI AKSES (Hanya Super Admin) ---
  if (user?.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-fade-in">
        <div className="bg-red-100 p-6 rounded-full mb-4">
            <ShieldCheck size={64} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Akses Ditolak</h2>
        <p className="text-slate-500 max-w-md mt-2">
          Menu ini berisi data sensitif perusahaan (Sell-out Dealer). Hanya Administrator Pusat yang memiliki akses.
        </p>
      </div>
    );
  }

  // --- LOGIC PENCARIAN MANUAL ---
  const handleCheck = (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setErrorMsg('');

    setTimeout(() => {
      setLoading(false);
      
      const found = COVERAGE_DB.find(item => 
        item.imei.toLowerCase() === imei.toLowerCase() || 
        item.serialNumber.toLowerCase() === imei.toLowerCase()
      );

      if (found) {
        setResult(found);
      } else {
        setErrorMsg('IMEI / Serial Number tidak ditemukan di database PT Global Danapati Niaga.');
      }
    }, 1500);
  };

  // --- LOGIC BULK UPLOAD ---
  const handleBulkUpload = () => {
    setIsBulkProcessing(true);
    setTimeout(() => {
      setIsBulkProcessing(false);
      alert("File berhasil diproses! Hasil download otomatis dimulai.");
    }, 2000);
  };

  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      
      {/* HEADER & TITLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ShieldCheck className="text-blue-600" /> Apple Coverage Checker
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Validasi status garansi & sell-out date via Apple GSX API (Internal Database Match).
          </p>
        </div>
      </div>

      {/* STATISTIK RINGKAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600"><Globe size={24}/></div>
            <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Total Checked</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white">1,240 <span className="text-xs font-normal">Unit</span></p>
            </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600"><CheckCircle size={24}/></div>
            <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Active Coverage</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white">850 <span className="text-xs font-normal">Unit</span></p>
            </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600"><AlertCircle size={24}/></div>
            <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Unknown / Not Found</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white">45 <span className="text-xs font-normal">Unit</span></p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: FORM PENCARIAN */}
        <div className="lg:col-span-1 space-y-6">
            
            {/* Manual Search */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Search size={18} className="text-blue-500"/> Single Check
                </h3>
                <form onSubmit={handleCheck} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">IMEI / Serial Number</label>
                        <input 
                            type="text" 
                            required
                            placeholder="Ex: 356789..."
                            value={imei}
                            onChange={(e) => setImei(e.target.value)}
                            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading || !imei}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Check Status'}
                    </button>
                </form>
            </div>

            {/* Bulk Search */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Database size={18} className="text-green-500"/> Bulk Check
                </h3>
                
                <div 
                    onClick={() => alert("Download Template Coverage...")}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-green-500 transition-colors group mb-4"
                >
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded text-green-600"><FileSpreadsheet size={20}/></div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Template_Coverage.xlsx</p>
                        <p className="text-[10px] text-slate-400">Klik untuk download format</p>
                    </div>
                    <Download size={16} className="text-slate-400 group-hover:text-green-500"/>
                </div>

                <div 
                    onClick={handleBulkUpload}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                    {isBulkProcessing ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className="animate-spin text-blue-500 mb-2" size={24}/>
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Processing Data...</p>
                        </div>
                    ) : (
                        <>
                            <FileUp className="mx-auto text-slate-400 mb-2" size={24}/>
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Upload Excel File</p>
                            <p className="text-[10px] text-slate-400">Max 1000 Baris</p>
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* KOLOM KANAN: HASIL OUTPUT */}
        <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm min-h-[400px]">
                <h3 className="font-bold text-slate-800 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                    Hasil Pengecekan
                </h3>

                {loading && (
                    <div className="flex flex-col items-center justify-center h-64 opacity-50">
                        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                        <p className="text-slate-500">Menghubungi Server Apple & Database Internal...</p>
                    </div>
                )}

                {!loading && errorMsg && (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-4">
                            <XCircle className="text-red-500" size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Data Tidak Ditemukan</h3>
                        <p className="text-slate-500 max-w-md">{errorMsg}</p>
                    </div>
                )}

                {!loading && !result && !errorMsg && (
                    <div className="flex flex-col items-center justify-center h-64 text-center opacity-30">
                        <Smartphone size={64} className="mb-4" />
                        <p>Silakan masukkan IMEI / SN untuk melihat detail coverage.</p>
                    </div>
                )}

                {/* RESULT CARD DETAIL */}
                {!loading && result && (
                    <div className="space-y-6 animate-slide-up">
                        {/* Status Banner (Mobile Responsive Font: text-base) */}
                        <div className={`p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 ${result.coverageEnd !== '-' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                {result.coverageEnd !== '-' ? <CheckCircle className="text-green-600 flex-shrink-0" size={32}/> : <AlertCircle className="text-slate-500 flex-shrink-0" size={32}/>}
                                <div>
                                    <h4 className={`font-bold text-base sm:text-lg ${result.coverageEnd !== '-' ? 'text-green-800 dark:text-green-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {result.coverageEnd !== '-' ? 'Coverage Active' : 'Coverage Info Unavailable'}
                                    </h4>
                                    <p className="text-xs opacity-70">
                                        {result.type === 'iPhone' ? 'Valid Apple Warranty & Sell-out Date' : 'Non-Cellular Product / Wifi Only'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-t-0 border-slate-200 dark:border-slate-700 pt-2 sm:pt-0">
                                <p className="text-xs font-bold uppercase opacity-60">Coverage End</p>
                                <p className="font-mono font-bold text-base sm:text-lg">{result.coverageEnd}</p>
                            </div>
                        </div>

                        {/* Grid Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Product Info */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800 pb-2">Product Info</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="col-span-2">
                                        <p className="text-slate-500 text-xs">Product Name</p>
                                        <p className="font-bold text-slate-800 dark:text-white">{result.productName}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs">SKU</p>
                                        <p className="font-mono text-slate-800 dark:text-white text-xs">{result.sku}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs">Serial Number</p>
                                        <p className="font-mono text-slate-800 dark:text-white text-xs">{result.serialNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs">IMEI</p>
                                        <p className="font-mono text-slate-800 dark:text-white text-xs">{result.imei || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sales Info (Revisi: Layout Invoice diperbaiki) */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800 pb-2">Sales Info (Internal)</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="col-span-2">
                                        <p className="text-slate-500 text-xs">Dealer Name</p>
                                        <p className="font-bold text-slate-800 dark:text-white">{result.dealer}</p>
                                    </div>
                                    
                                    {/* Invoice No Pindah ke Baris Sendiri (col-span-2) agar tidak terpotong */}
                                    <div className="col-span-2">
                                        <p className="text-slate-500 text-xs">Invoice No</p>
                                        <p className="font-medium text-slate-800 dark:text-white font-mono tracking-wide">{result.invoiceNo}</p>
                                    </div>

                                    <div>
                                        <p className="text-slate-500 text-xs">Invoice Date</p>
                                        <p className="font-medium text-slate-800 dark:text-white">{result.invoiceDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs">Coverage Start</p>
                                        <p className={`font-bold ${result.coverageStart !== '-' ? 'text-blue-600' : 'text-slate-400'}`}>{result.coverageStart}</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
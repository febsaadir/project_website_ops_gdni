import React, { useState, useMemo } from 'react';
import { 
  Search, Smartphone, Tablet, Monitor, Headphones, 
  Tag, Info, X, Check, AlertTriangle, ChevronRight, Box
} from 'lucide-react';
// Pastikan path import data benar
import { PRODUCT_CATALOG } from '../data/productInfoData';

// Format Rupiah
const formatIDR = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

// Helper Status Stok
const getStockBadge = (status) => {
    if (status === 'Available') return { label: 'Available (>10)', color: 'bg-green-100 text-green-700 border-green-200' };
    if (status === 'Low Stock') return { label: 'Low Stock (≤10)', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    return { label: 'Empty Stock', color: 'bg-red-100 text-red-700 border-red-200' };
};

// Simulasi Aging
const getAgingStatus = (id) => {
    // Logic dummy: ID mengandung '15' = Fresh, lainnya Aging (sekadar contoh)
    const isFresh = id.includes('15') || id.includes('M2'); 
    if (!isFresh) return { label: 'AGING (>90 Days)', color: 'bg-red-500 text-white animate-pulse' };
    return { label: 'FRESH (<30 Days)', color: 'bg-green-500 text-white' };
};

export default function ProductInfo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null); 

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return PRODUCT_CATALOG.filter(product => {
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [searchQuery, selectedCategory]);

  const categories = [
    { name: 'All', icon: Box },
    { name: 'iPhone', icon: Smartphone },
    { name: 'iPad', icon: Tablet },
    { name: 'Mac', icon: Monitor },
    { name: 'Accessories', icon: Headphones },
  ];

  return (
    <div className="space-y-8 pb-10 animate-fade-in min-h-screen relative">
      
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Info className="text-purple-600" /> Product Knowledge Center
          </h1>
          <p className="text-slate-500 text-sm mt-1">Panduan harga, spesifikasi, dan kompatibilitas produk.</p>
        </div>
        <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari Produk / SKU..." 
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none shadow-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat.name 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-purple-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <cat.icon size={16} /> {cat.name}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const stockInfo = getStockBadge(product.stockStatus);
            const agingInfo = getAgingStatus(product.id);

            return (
                <div 
                key={product.id} 
                onClick={() => setSelectedProduct(product)}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 cursor-pointer flex flex-col"
                >
                {/* Card Image Area */}
                <div className="h-48 bg-slate-50 dark:bg-slate-800 flex items-center justify-center relative p-4">
                    {/* Logic Gambar: Jika ada image di data, pakai image. Jika tidak, pakai Icon default */}
                    {product.image ? (
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="h-full w-full object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="text-slate-300 dark:text-slate-600">
                            {product.category === 'iPhone' ? <Smartphone size={64}/> : 
                            product.category === 'iPad' ? <Tablet size={64}/> :
                            product.category === 'Mac' ? <Monitor size={64}/> : <Headphones size={64}/>}
                        </div>
                    )}
                    
                    {/* Badge Aging */}
                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full shadow-lg ${agingInfo.color}`}>
                        {agingInfo.label}
                    </span>

                    {/* Badge Stock */}
                    <span className={`absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md border bg-white/90 dark:bg-slate-900/90 ${stockInfo.color}`}>
                        {stockInfo.label}
                    </span>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col">
                    <div className="mb-4 flex-1">
                        <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-1">{product.category}</p>
                        <h3 className="font-bold text-slate-800 dark:text-white leading-tight group-hover:text-purple-600 transition-colors line-clamp-2">
                            {product.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono mt-1">{product.sku}</p>
                    </div>
                    
                    {/* Quick Price */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">STP Promo (Dealer)</p>
                        <div className="flex items-end gap-2">
                            <p className="text-lg font-bold text-slate-800 dark:text-white">{formatIDR(product.pricing.stpPromo)}</p>
                        </div>
                    </div>
                </div>
                </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 opacity-50">
            <Search size={48} className="mx-auto mb-4 text-slate-400"/>
            <p className="text-lg font-bold text-slate-600 dark:text-slate-300">Produk tidak ditemukan</p>
            <p className="text-sm text-slate-500">Coba kata kunci atau kategori lain.</p>
        </div>
      )}

      {/* --- MODAL DETAIL PRODUCT --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                
                {/* Modal Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/50 flex-shrink-0">
                    <div className="flex gap-4 items-center">
                        {/* Gambar Kecil di Header Modal */}
                        {selectedProduct.image ? (
                             <img src={selectedProduct.image} alt={selectedProduct.name} className="w-12 h-12 object-contain rounded bg-white p-1 border border-slate-200"/>
                        ) : (
                             <div className="w-12 h-12 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                 <Box size={24}/>
                             </div>
                        )}
                        <div>
                            <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded mb-1 inline-block">
                                {selectedProduct.category}
                            </span>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white leading-tight">{selectedProduct.name}</h2>
                            <p className="text-xs text-slate-500 font-mono">{selectedProduct.sku}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedProduct(null)}
                        className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors"
                    >
                        <X size={20}/>
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-5 overflow-y-auto">
                    
                    {/* PRICING TABLE */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                            <Tag size={16}/> Price (Rupiah)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            {/* STP (Dealer Price) */}
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
                                <p className="text-xs font-bold text-blue-600 uppercase mb-2">STP (Modal Dealer)</p>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs sm:text-sm text-slate-500">Normal</span>
                                    <span className="font-mono text-slate-700 dark:text-slate-300 text-sm">{formatIDR(selectedProduct.pricing.stpNormal)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">Promo</span>
                                    <span className="font-mono font-bold text-base sm:text-lg text-blue-600">{formatIDR(selectedProduct.pricing.stpPromo)}</span>
                                </div>
                            </div>

                            {/* SRP (User Price) */}
                            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-800">
                                <p className="text-xs font-bold text-green-600 uppercase mb-2">SRP (Harga User)</p>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs sm:text-sm text-slate-500">Normal</span>
                                    <span className="font-mono text-slate-700 dark:text-slate-300 text-sm">{formatIDR(selectedProduct.pricing.srpNormal)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">Promo</span>
                                    <span className="font-mono font-bold text-base sm:text-lg text-green-600">{formatIDR(selectedProduct.pricing.srpPromo)}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Note Box */}
                        {selectedProduct.notes && (
                            <div className="mt-3 flex items-start gap-2 text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg border border-orange-100 dark:border-orange-900/20">
                                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0"/>
                                <span><b>Note:</b> {selectedProduct.notes}</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* SPECIFICATIONS */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                <Info size={16}/> Key Specs
                            </h3>
                            <ul className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                                {selectedProduct.specs.map((spec, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0"></div>
                                        {spec}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* COMPATIBILITY CHECK */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                <Check size={16}/> Compatibility
                            </h3>
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                                <ul className="space-y-2">
                                    {selectedProduct.compatibility.map((item, idx) => (
                                        <li key={idx} className={`text-sm flex items-start gap-2 ${item.includes('BUTUH ADAPTER') || item.includes('TIDAK') ? 'text-red-500 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                                            <ChevronRight size={14} className="mt-1 flex-shrink-0 text-slate-400"/>
                                            <span className="leading-snug">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end flex-shrink-0">
                    <button 
                        onClick={() => setSelectedProduct(null)}
                        className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 dark:bg-slate-700 text-white rounded-lg font-bold text-sm hover:bg-slate-700 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
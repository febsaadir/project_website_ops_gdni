// src/data/productInfoData.js

// Import gambar
import imgIphone15 from '../assets/products/iphone_15_256GB.png';

export const PRODUCT_CATALOG = [
  {
    id: 'IP15-128', // Kita update ID ini agar sesuai dengan gambar
    category: 'iPhone',
    name: 'iPhone 15 128GB',
    sku: 'MTP03PA/A',
    image: imgIphone15, // Gunakan variabel import gambar
    specs: ['A16 Bionic', 'USB-C', '48MP Camera', 'Dynamic Island'],
    compatibility: [
      'USB-C Charge Cable (Included)',
      'MagSafe Charger',
      'AirPods Pro (2nd Gen, USB-C)'
    ],
    pricing: {
      stpNormal: 15100000,
      stpPromo: 14850000, 
      srpNormal: 16499000,
      srpPromo: 15999000  
    },
    stockStatus: 'Available',
    notes: 'Promo cashback bank berlaku hingga 31 Jan.'
  },
  // ... produk lainnya biarkan menggunakan placeholder atau tambahkan gambar lain jika ada
  {
    id: 'IPAD-10-WIFI',
    category: 'iPad',
    name: 'iPad (10th Gen) 64GB Wi-Fi',
    sku: 'MPQ03PA/A',
    image: null, // Jika null, nanti akan pakai ikon default
    specs: ['A14 Bionic', '10.9" Liquid Retina', 'USB-C', 'Touch ID'],
    compatibility: [
      'Apple Pencil (USB-C)',
      'Magic Keyboard Folio',
      'Apple Pencil (1st Gen) - BUTUH ADAPTER'
    ],
    pricing: {
      stpNormal: 6800000,
      stpPromo: 6650000,
      srpNormal: 7499000,
      srpPromo: 7299000
    },
    stockStatus: 'Low Stock',
    notes: 'Hati-hati, TIDAK kompatibel dengan Pencil Gen 2.'
  },
  {
    id: 'MBA-M2-13',
    category: 'Mac',
    name: 'MacBook Air 13" M2 Chip 256GB',
    sku: 'MLXW3ID/A',
    image: null,
    specs: ['M2 Chip', '13.6" Liquid Retina', 'MagSafe 3', '1080p Camera'],
    compatibility: [
      '30W USB-C Power Adapter',
      'Magic Mouse 2',
      'Studio Display'
    ],
    pricing: {
      stpNormal: 15500000,
      stpPromo: 14900000,
      srpNormal: 16999000,
      srpPromo: 16499000
    },
    stockStatus: 'Available',
    notes: 'Best seller untuk mahasiswa.'
  },
  {
    id: 'ACC-PEN-USBC',
    category: 'Accessories',
    name: 'Apple Pencil (USB-C)',
    sku: 'MUWA3ZA/A',
    image: null,
    specs: ['USB-C Charging', 'Magnetic Attach', 'Pixel-perfect precision'],
    compatibility: [
      'iPad (10th Gen)',
      'iPad Air (4th, 5th Gen)',
      'iPad Pro 11" (All Gen)',
      'iPad Pro 12.9" (3rd Gen & later)',
      'iPad mini (6th Gen)'
    ],
    pricing: {
      stpNormal: 1250000,
      stpPromo: 1250000,
      srpNormal: 1399000,
      srpPromo: 1399000
    },
    stockStatus: 'Available',
    notes: 'Tidak support pressure sensitivity & wireless charging.'
  }
];
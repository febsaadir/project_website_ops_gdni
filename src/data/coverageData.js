// src/data/coverageData.js

export const COVERAGE_DB = [
  // Kasus 1: iPhone (Lengkap dengan Coverage)
  {
    imei: '356789012345678',
    serialNumber: 'HFD789KLM',
    sku: 'IP15-PM-256-NAT',
    type: 'iPhone',
    productName: 'iPhone 15 Pro Max 256GB Natural Titanium',
    dealer: 'Erafone Megastore Depok',
    invoiceDate: '2024-11-20',
    invoiceNo: 'INV/GDN3/DPK/2411/5501',
    coverageStart: '2024-11-21',
    coverageEnd: '2025-11-21',
    status: 'Active',
    isFound: true
  },
  // Kasus 2: iPad WiFi Only (Non-Cellular, Coverage Kosong/N/A)
  {
    imei: 'SN-IPAD-WIFI-001', // Serial Number
    serialNumber: 'SN-IPAD-WIFI-001',
    sku: 'IPAD-10-64-BLU',
    type: 'iPad',
    productName: 'iPad 10th Gen 64GB Blue WiFi',
    dealer: 'iBox Senayan City',
    invoiceDate: '2024-12-05',
    invoiceNo: 'INV/GDN3/JKT/2412/1002',
    coverageStart: '-', // Tidak ada data cellular coverage
    coverageEnd: '-',
    status: 'Wifi Only',
    isFound: true
  },
  // Kasus 3: Mac (Non-iPhone)
  {
    imei: 'SN-MAC-M3-009',
    serialNumber: 'SN-MAC-M3-009',
    sku: 'MBP-14-M3-512',
    type: 'Mac',
    productName: 'MacBook Pro 14 M3 512GB Space Grey',
    dealer: 'Digimap PIM 3',
    invoiceDate: '2024-10-10',
    invoiceNo: 'INV/GDN3/JKT/2410/8899',
    coverageStart: '-',
    coverageEnd: '-',
    status: 'Mac Product',
    isFound: true
  }
];
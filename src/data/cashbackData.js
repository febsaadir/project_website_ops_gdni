// Database IMEI (Reseller App Sync)
export const MOCK_DB = [
  { 
    imei: 'SDJ6HX9G96V', 
    invoiceDate: '2025-01-14', 
    invoiceNo: 'INV/GDN3/BP/2501/10026', 
    activeDate: '2025-12-13', 
    cermatiDate: '2025-02-15',
    dealerId: 'DLR-001',
    dealerName: 'CV Halup Berkah Makmur',
    sku: 'MXN63PA/A',
    type: 'iPad Mini',
    productName: 'iPad mini Wi-Fi 128GB - Space Grey',
    invoicePrice: 9030000,
    stpPromo: 8880000,
    status: 'claimed', 
    branch: 'GDN3 Balikpapan'
  },
  { 
    imei: '356789012345999', 
    invoiceDate: '2025-12-10', 
    invoiceNo: 'INV/GDN/DEC/088', 
    activeDate: '2025-12-11', 
    cermatiDate: '-',
    dealerId: 'DLR-055',
    dealerName: 'Erafone Depok',
    sku: 'IP14-128-PUR',
    type: 'Smartphone',
    productName: 'iPhone 14 128GB Purple',
    invoicePrice: 10500000,
    stpPromo: 10400000,
    status: 'available', 
    branch: 'GDN3 Depok'
  }
];


export const UPLOAD_HISTORY_DATA = [
  { 
    id: 1, 
    period: 'Desember 2025', 
    area: 'Jabo 1', 
    file: 'Recap_Cashback_Jabo1_Dec.xlsx', 
    date: '2026-01-02', 
    status: 'Pending Review', 
    uploader: 'Admin Jabo 1',
    totalData: 150,
    totalClaim: 45000000 
  },
  { 
    id: 2, 
    period: 'Desember 2025', 
    area: 'Jateng', 
    file: 'Recap_Cashback_Jateng_Dec.xlsx', 
    date: '2026-01-03', 
    status: 'Verified', 
    uploader: 'Admin Jateng',
    totalData: 80,
    totalClaim: 24000000
  },
  { 
    id: 3, 
    period: 'Desember 2025', 
    area: 'Jabo 2', 
    file: 'Recap_Cashback_Jabo2_Dec.xlsx', 
    date: '2026-01-04', 
    status: 'Declined', 
    uploader: 'Admin Jabo 2',
    totalData: 45,
    totalClaim: 12500000,
    reason: 'Format invoice tidak sesuai standard'
  },
];
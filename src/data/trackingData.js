// src/data/trackingData.js

// 1. DATA INTERCOMPANY (Plan vs PO)
export const INTERCOMPANY_DATA = [
  {
    id: 'PLAN-001',
    entity: 'PT Global Distribusi Nusantara (GDNus)',
    product: 'iPhone 13 128GB Midnight',
    planQty: 100,
    fulfilledQty: 100, // Fullfilled
    poList: ['PO/GDN2/2512/10130'],
    status: 'Fulfilled'
  },
  {
    id: 'PLAN-002',
    entity: 'PT Global Distribusi Nusantara (GDNus)',
    product: 'iPhone 16 128GB Teal',
    planQty: 1, // Porsi kecil
    fulfilledQty: 1, 
    poList: ['PO/GDN2/2512/10133'], // Sesuai prompt
    status: 'Fulfilled'
  },
  {
    id: 'PLAN-003',
    entity: 'PT Global Astha Niaga (Mono)',
    product: 'MacBook Air M3 13"',
    planQty: 50,
    fulfilledQty: 30, // Belum full
    poList: ['PO/GAN/2512/5501'],
    status: 'In Progress'
  }
];

// 2. DATA DISTY ALLOCATION (Log Barang Keluar / SO)
export const DISTY_LOGS = [
  {
    id: 'SO-001',
    branch: 'GDN3 Cempaka Mas',
    area: 'Jabo 1',
    product: 'MacBook Air M4 13" Space Grey',
    qty: 5,
    soNumber: 'SO/GDN3/CM/2512/10169',
    date: '2025-12-28',
    status: 'Shipped'
  },
  {
    id: 'SO-002',
    branch: 'GDN3 Banjarmasin',
    area: 'Kalimantan',
    product: 'iPad Air 5 64GB WiFi',
    qty: 10,
    soNumber: 'SO/GDN3/BJM/2512/2002',
    date: '2025-12-29',
    status: 'Processing'
  }
];

// 3. DATA REQUEST QUEUE (Request dari Area)
// FIX: Gunakan format ISO (YYYY-MM-DDTHH:mm:ss) agar aman di semua browser
export const REQUEST_QUEUE = [
  {
    id: 'REQ-101',
    requestor: 'Agus',
    branch: 'GDN3 Roxy',
    area: 'Jabo 2',
    product: 'Airpods 4 ANC',
    qty: 3,
    requestDate: '2026-01-04T09:00:00', // Format ISO dengan T
    storage: 'WSK', 
    status: 'Pending', 
    approvalStatus: 'Approved' 
  },
  {
    id: 'REQ-102',
    requestor: 'Bayan',
    branch: 'GDN3 Cempaka Mas',
    area: 'Jabo 1',
    product: 'iPad Gen 11 WiFi 512GB Purple',
    qty: 7,
    requestDate: '2026-01-04T10:30:00',
    storage: 'NonDisty', 
    status: 'Confirming', 
    approvalStatus: 'Waiting Approval' 
  },
  {
    id: 'REQ-103',
    requestor: 'Siti',
    branch: 'GDN3 Denpasar',
    area: 'Bali',
    product: 'iPhone 15 128GB Blue',
    qty: 2,
    requestDate: '2026-01-01T08:00:00', // Sudah > 2 hari
    storage: 'DG',
    status: 'Expired',
    approvalStatus: 'Approved'
  }
];
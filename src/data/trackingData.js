// src/data/trackingData.js

export const WAREHOUSE_STOCK = {
  WSK: { label: 'WSK (Main)', count: 450, color: 'text-blue-600', bg: 'bg-blue-100', access: 'Open' },
  DG: { label: 'DG (Damage/Return)', count: 25, color: 'text-orange-600', bg: 'bg-orange-100', access: 'Open' },
  NonDisty: { label: 'Non-Disty (Project)', count: 120, color: 'text-purple-600', bg: 'bg-purple-100', access: 'Restricted', approver: 'Dean / P\'Maic' },
  Unsellable: { label: 'Unsellable (Reg)', count: 50, color: 'text-red-600', bg: 'bg-red-100', access: 'Locked', reason: 'Kemenperin Issue' },
};

export const INTERCOMPANY_POS = [
  {
    id: 'PO/GDN2/2512/10133',
    entity: 'PT Global Distribusi Nusantara',
    product: 'iPhone 16 128GB Teal',
    planQty: 1,
    poQty: 1,
    status: 'Fulfillable', // Sesuai Plan
    date: '2025-12-28',
  },
  {
    id: 'PO/GAN/2512/889',
    entity: 'PT Global Astha Niaga (Mono)',
    product: 'iPhone 13 128GB Midnight',
    planQty: 100,
    poQty: 120, // Over Plan
    status: 'Over Plan',
    date: '2025-12-29',
  },
  {
    id: 'PO/GTN/2512/554',
    entity: 'PT Global Teknologi Niaga',
    product: 'MacBook Air M2',
    planQty: 50,
    poQty: 20,
    status: 'Fulfillable',
    date: '2025-12-30',
  }
];

export const DISTY_OUTBOUND_LOG = [
  { id: 'SO/GDN3/CM/2512/10169', branch: 'GDN3 Cempaka Mas', product: 'MacBook Air M4', qty: 5, date: '2025-12-25', status: 'Shipped' },
  { id: 'SO/GDN3/RX/2512/10170', branch: 'GDN3 Roxy', product: 'iPhone 15 128GB', qty: 10, date: '2025-12-26', status: 'Processing' },
];

export const REQUEST_QUEUE = [
  {
    id: 'REQ-001',
    requester: 'Agus',
    branch: 'GDN3 Roxy',
    area: 'Jabo 2',
    product: 'Airpods 4 ANC',
    qty: 3,
    requestDate: '2026-01-03', // Masih valid (asumsi hari ini 4 Jan 2026)
    status: 'Pending', // Pending, Ordered, Cancelled, Confirming
    source: null,
    pic: 'Rifqi' 
  },
  {
    id: 'REQ-002',
    requester: 'Bayan',
    branch: 'GDN3 Cempaka Mas',
    area: 'Jabo 1',
    product: 'iPad Gen 11 Wifi 512GB Purple',
    qty: 7,
    requestDate: '2026-01-04', // Hari ini
    status: 'Confirming',
    source: 'WSK',
    pic: 'Anda' // User session
  },
  {
    id: 'REQ-003',
    requester: 'Siti',
    branch: 'GDN3 Banjarmasin',
    area: 'Kalimantan',
    product: 'iPhone 13 128GB',
    qty: 5,
    requestDate: '2026-01-01', // Sudah Expired (> 2 hari)
    status: 'Pending',
    source: null,
    pic: 'Anda'
  }
];
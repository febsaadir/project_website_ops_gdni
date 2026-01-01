import React from 'react';
import { Truck, MapPin, Package, ExternalLink, Calendar } from 'lucide-react';

const SHIPMENTS = [
  { id: 'PO-GDN-001', entity: 'PT Global Distribusi Nusantara', dest: 'GDN3 Cempaka Mas', status: 'Delivered', eta: '2025-12-28', items: 'iPhone 16 (500 Unit)' },
  { id: 'PO-GAN-088', entity: 'PT Global Astha Niaga (Mono)', dest: 'iBox Senayan City', status: 'In Transit', eta: '2026-01-05', items: 'MacBook Air M3 (120 Unit)' },
  { id: 'PO-GTN-102', entity: 'PT Global Teknologi Niaga', dest: 'Samsung Store GI', status: 'Processing', eta: '2026-01-10', items: 'Galaxy S25 Ultra (200 Unit)' },
  { id: 'PO-ECOmm-99', entity: 'PT Global Digital Niaga', dest: 'Warehouse Cawang', status: 'Pending', eta: 'TBA', items: 'Accessories Mix (1000 Pcs)' },
];

export default function TrackingAllocation() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Truck className="text-orange-600" /> Tracking Allocation
        </h1>
        <p className="text-slate-500 text-sm mt-1">Monitor pergerakan stok Intercompany & Fulfillment PO.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">PO Number</th>
                <th className="px-6 py-4">Entity (Source)</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">ETA</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {SHIPMENTS.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{item.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{item.entity}</td>
                  <td className="px-6 py-4 flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <MapPin size={14}/> {item.dest}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1"><Package size={14}/> {item.items}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold 
                      ${item.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                        item.status === 'In Transit' ? 'bg-blue-100 text-blue-700' : 
                        item.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-slate-100 text-slate-600'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{item.eta}</td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-slate-400 hover:text-blue-600 transition-colors">
                      <ExternalLink size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, CheckCircle, XCircle, Download } from 'lucide-react';
import { format, isPast, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

export default function Inventory() {
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'lot' | 'summary'>('lot');

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setStock(data.stockData);
        setLoading(false);
      });
  }, []);

  // Group by drug for summary view
  const summaryStock = React.useMemo(() => {
    const map = new Map();
    stock.forEach(item => {
      if (!map.has(item.drug_id)) {
        map.set(item.drug_id, {
          ...item,
          qty: 0,
          lots: []
        });
      }
      const entry = map.get(item.drug_id);
      entry.qty += item.qty;
      entry.lots.push(item);
    });
    return Array.from(map.values());
  }, [stock]);

  const filtered = (viewMode === 'lot' ? stock : summaryStock).filter(item => 
    item.drug_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.drug_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getExpiryStatus = (dateStr: string) => {
    if (!dateStr) return 'unknown';
    const date = new Date(dateStr);
    const today = new Date();
    if (isPast(date)) return 'expired';
    if (date < addMonths(today, 3)) return 'critical';
    if (date < addMonths(today, 6)) return 'warning';
    return 'good';
  };

  const handleExport = () => {
    const dataToExport = filtered.map(item => ({
      'Drug ID': item.drug_id,
      'Drug Name': item.drug_name,
      'Lot No': viewMode === 'lot' ? item.lot_no : 'N/A',
      'Expiry Date': viewMode === 'lot' ? item.exp_date : 'N/A',
      'Quantity': item.qty,
      'Min Stock': item.min_stock,
      'Location': `${item.cabinet} ${item.shelf ? `/ ${item.shelf}` : ''}`,
      'Status': viewMode === 'lot' ? getExpiryStatus(item.exp_date) : (item.qty < item.min_stock ? 'Low' : 'Good')
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, `inventory_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-slate-100">คลังยา (Inventory)</h2>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-800 p-1 rounded-xl w-fit border border-slate-700">
            <button 
              onClick={() => setViewMode('lot')}
              className={cn(
                "px-6 py-2 text-base font-medium rounded-lg transition-all",
                viewMode === 'lot' ? "bg-teal-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
              )}
            >
              แยก Lot
            </button>
            <button 
              onClick={() => setViewMode('summary')}
              className={cn(
                "px-6 py-2 text-base font-medium rounded-lg transition-all",
                viewMode === 'summary' ? "bg-teal-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
              )}
            >
              สรุปยอดรวม
            </button>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 border border-slate-600 rounded-xl hover:bg-slate-700 text-slate-300 bg-slate-800 text-base"
          >
            <Download className="w-5 h-5" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="ค้นหาชื่อยา หรือ รหัสยา..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-600 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-500 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-base text-left">
            <thead className="bg-slate-900 text-slate-400 font-medium uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">ชื่อยา</th>
                {viewMode === 'lot' && <th className="px-6 py-4">Lot No</th>}
                {viewMode === 'lot' && <th className="px-6 py-4">วันหมดอายุ</th>}
                <th className="px-6 py-4 text-right">คงเหลือ</th>
                <th className="px-6 py-4 text-right">Min Stock</th>
                <th className="px-6 py-4">ที่เก็บ</th>
                <th className="px-6 py-4">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500 text-lg">กำลังโหลด...</td></tr>
              ) : filtered.map((item, idx) => {
                const status = viewMode === 'lot' ? getExpiryStatus(item.exp_date) : (item.qty < item.min_stock ? 'critical' : 'good');
                
                return (
                  <tr key={idx} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {item.drug_name}
                      <div className="text-sm text-slate-500 font-mono">{item.drug_id}</div>
                    </td>
                    {viewMode === 'lot' && <td className="px-6 py-4 text-slate-400">{item.lot_no}</td>}
                    {viewMode === 'lot' && (
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-sm font-medium px-3 py-1 rounded-full",
                          status === 'expired' ? "bg-red-900/30 text-red-400 border border-red-900/50" :
                          status === 'critical' ? "bg-orange-900/30 text-orange-400 border border-orange-900/50" :
                          status === 'warning' ? "bg-amber-900/30 text-amber-400 border border-amber-900/50" :
                          "text-slate-400"
                        )}>
                          {format(new Date(item.exp_date), 'dd/MM/yyyy')}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-right font-bold text-xl text-slate-200">{item.qty}</td>
                    <td className="px-6 py-4 text-right text-slate-500">{item.min_stock}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {item.cabinet} {item.shelf && `/ ${item.shelf}`}
                    </td>
                    <td className="px-6 py-4">
                      {item.qty <= 0 ? (
                        <span className="inline-flex items-center gap-2 text-red-400 text-sm font-medium bg-red-900/20 px-3 py-1 rounded-full border border-red-900/50">
                          <XCircle className="w-4 h-4" /> สินค้าหมด
                        </span>
                      ) : item.qty < item.min_stock ? (
                        <span className="inline-flex items-center gap-2 text-amber-400 text-sm font-medium bg-amber-900/20 px-3 py-1 rounded-full border border-amber-900/50">
                          <AlertTriangle className="w-4 h-4" /> ต่ำกว่าเกณฑ์
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-green-400 text-sm font-medium bg-green-900/20 px-3 py-1 rounded-full border border-green-900/50">
                          <CheckCircle className="w-4 h-4" /> ปกติ
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

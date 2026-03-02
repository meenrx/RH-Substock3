import React, { useState, useEffect } from 'react';
import { RefreshCw, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Audit() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchRandomItems();
  }, []);

  const fetchRandomItems = () => {
    setLoading(true);
    fetch('/api/audit/random')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
        setResults({});
      });
  };

  const handleCountChange = (id: string, lot: string, value: string) => {
    const key = `${id}|${lot}`;
    setResults(prev => ({
      ...prev,
      [key]: parseInt(value) || 0
    }));
  };

  const handleSubmit = async () => {
    const payload = items.map(item => {
      const key = `${item.drug_id}|${item.lot_no}`;
      return {
        ...item,
        actual_qty: results[key] ?? item.qty
      };
    });

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payload, user: 'Admin' })
      });
      
      if (res.ok) {
        alert('Audit submitted successfully');
        fetchRandomItems();
      } else {
        alert('Failed to submit audit');
      }
    } catch (error) {
      console.error(error);
      alert('Error submitting audit');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-slate-100">สุ่มนับสต็อก (Random Audit)</h2>
        <button 
          onClick={fetchRandomItems}
          className="flex items-center gap-2 px-6 py-3 border border-slate-600 rounded-xl hover:bg-slate-700 text-slate-300 bg-slate-800 text-lg"
        >
          <RefreshCw className="w-5 h-5" />
          สุ่มรายการใหม่
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-base text-left">
            <thead className="bg-slate-900 text-slate-400 font-medium uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">ชื่อยา</th>
                <th className="px-6 py-4">Lot No</th>
                <th className="px-6 py-4">ที่เก็บ</th>
                <th className="px-6 py-4 text-right">ยอดในระบบ</th>
                <th className="px-6 py-4 w-40">ยอดที่นับได้</th>
                <th className="px-6 py-4 w-32">ผลต่าง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500 text-lg">กำลังโหลด...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500 text-lg">ไม่มีรายการตรวจสอบ</td></tr>
              ) : items.map((item, idx) => {
                const key = `${item.drug_id}|${item.lot_no}`;
                const actual = results[key];
                const diff = actual !== undefined ? actual - item.qty : 0;
                
                return (
                  <tr key={idx} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {item.drug_name}
                      <div className="text-sm text-slate-500 font-mono">{item.drug_id}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{item.lot_no}</td>
                    <td className="px-6 py-4 text-slate-400">{item.cabinet} {item.shelf && `/ ${item.shelf}`}</td>
                    <td className="px-6 py-4 text-right font-bold text-xl text-slate-200">{item.qty}</td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-900 text-slate-100 text-lg"
                        placeholder={item.qty.toString()}
                        onChange={(e) => handleCountChange(item.drug_id, item.lot_no, e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      {actual !== undefined && (
                        <span className={cn(
                          "font-bold text-lg",
                          diff === 0 ? "text-green-400" : "text-red-400"
                        )}>
                          {diff > 0 ? '+' : ''}{diff}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 border-t border-slate-700 flex justify-end">
          <button 
            onClick={handleSubmit}
            disabled={loading || items.length === 0}
            className="px-8 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors flex items-center gap-2 text-lg font-medium shadow-lg shadow-teal-900/50"
          >
            <Save className="w-5 h-5" />
            บันทึกผลการนับ
          </button>
        </div>
      </div>
    </div>
  );
}

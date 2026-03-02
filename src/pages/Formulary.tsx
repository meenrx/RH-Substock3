import React, { useState, useEffect } from 'react';
import { Search, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormularyItem {
  drug_id: string;
  drug_name: string;
  min_stock: number;
  cabinet: string;
  reorder_point: number;
  shelf_location: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const EditableCell = ({ value, onSave, type = 'text' }: { value: any, onSave: (val: any) => void, type?: string }) => {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleBlur = () => {
    setEditing(false);
    if (tempValue !== value) {
      onSave(tempValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  if (editing) {
    return (
      <input
        autoFocus
        type={type}
        className="w-full px-3 py-2 border border-teal-500 rounded-lg focus:outline-none text-base bg-slate-700 text-slate-100"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <div 
      className="px-3 py-2 cursor-pointer hover:bg-slate-700 rounded-lg border border-transparent hover:border-slate-600 min-h-[36px] text-slate-300"
      onClick={() => setEditing(true)}
    >
      {value}
    </div>
  );
};

export default function Formulary() {
  const [items, setItems] = useState<FormularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFormulary();
  }, []);

  const fetchFormulary = () => {
    setLoading(true);
    fetch('/api/formulary')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      });
  };

  const handleUpdate = (id: string, field: keyof FormularyItem, value: any) => {
    setSavingId(id);
    
    // Optimistic update
    setItems(prev => prev.map(item => 
      item.drug_id === id ? { ...item, [field]: value } : item
    ));

    fetch(`/api/formulary/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value })
    })
    .then(() => setSavingId(null))
    .catch(() => {
      // Revert on error (simplified)
      fetchFormulary();
      setSavingId(null);
    });
  };

  const filtered = items.filter(item => 
    item.drug_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.drug_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-slate-100">บัญชีโรงพยาบาล (Formulary)</h2>
        <div className="text-base text-slate-400">
          คลิกที่ช่องเพื่อแก้ไขข้อมูล (บันทึกอัตโนมัติ)
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="ค้นหาชื่อยา..."
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
                <th className="px-6 py-4">รหัสยา</th>
                <th className="px-6 py-4">ชื่อยา</th>
                <th className="px-6 py-4 w-40">Min Stock</th>
                <th className="px-6 py-4 w-40">จุดสั่งซื้อ</th>
                <th className="px-6 py-4 w-40">ตู้ยา</th>
                <th className="px-6 py-4 w-40">ชั้นเก็บ</th>
                <th className="px-6 py-4 w-40">สถานะ</th>
                <th className="px-6 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr><td colSpan={8} className="p-8 text-center text-slate-500 text-lg">กำลังโหลด...</td></tr>
              ) : filtered.map((item) => (
                <tr key={item.drug_id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-slate-400">{item.drug_id}</td>
                  <td className="px-6 py-4 font-medium text-slate-200">{item.drug_name}</td>
                  <td className="px-6 py-4">
                    <EditableCell 
                      value={item.min_stock} 
                      type="number"
                      onSave={(val) => handleUpdate(item.drug_id, 'min_stock', parseInt(val))} 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <EditableCell 
                      value={item.reorder_point} 
                      type="number"
                      onSave={(val) => handleUpdate(item.drug_id, 'reorder_point', parseInt(val))} 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <EditableCell 
                      value={item.cabinet} 
                      onSave={(val) => handleUpdate(item.drug_id, 'cabinet', val)} 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <EditableCell 
                      value={item.shelf_location} 
                      onSave={(val) => handleUpdate(item.drug_id, 'shelf_location', val)} 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className={cn(
                        "px-3 py-1 rounded-lg text-sm font-medium border-none focus:ring-0 cursor-pointer",
                        item.status === 'ACTIVE' ? "bg-green-900/30 text-green-400" : "bg-slate-700 text-slate-400"
                      )}
                      value={item.status}
                      onChange={(e) => handleUpdate(item.drug_id, 'status', e.target.value)}
                    >
                      <option value="ACTIVE">ใช้งาน</option>
                      <option value="INACTIVE">ระงับ</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {savingId === item.drug_id && <Loader2 className="w-5 h-5 animate-spin text-teal-500" />}
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

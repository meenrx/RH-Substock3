import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [drugs, setDrugs] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    type: 'IN',
    date: new Date().toISOString().split('T')[0],
    drug_id: '',
    drug_name: '',
    lot_no: '',
    exp_date: '',
    pack_size: 1,
    qty: 0,
    price_per_unit: 0,
    user: 'Admin',
    reason: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetch('/api/formulary')
        .then(res => res.json())
        .then(data => setDrugs(data));
    }
  }, [isOpen]);

  const handleDrugChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const drugId = e.target.value;
    const drug = drugs.find(d => d.drug_id === drugId);
    if (drug) {
      setFormData(prev => ({
        ...prev,
        drug_id: drug.drug_id,
        drug_name: drug.drug_name
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          type: 'IN',
          date: new Date().toISOString().split('T')[0],
          drug_id: '',
          drug_name: '',
          lot_no: '',
          exp_date: '',
          pack_size: 1,
          qty: 0,
          price_per_unit: 0,
          user: 'Admin',
          reason: ''
        });
      } else {
        alert('Failed to save transaction');
      }
    } catch (error) {
      console.error(error);
      alert('Error saving transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800 z-10">
          <h3 className="text-2xl font-bold text-slate-100">เพิ่มรายการใหม่ (New Transaction)</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transaction Type */}
            <div className="col-span-2">
              <label className="block text-base font-medium text-slate-300 mb-3">ประเภทรายการ</label>
              <div className="flex gap-4">
                {['IN', 'OUT', 'ADJUST'].map((type) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="type" 
                      value={type}
                      checked={formData.type === type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-5 h-5 text-teal-600 focus:ring-teal-500 bg-slate-700 border-slate-600"
                    />
                    <span className={cn(
                      "px-4 py-2 rounded-full text-base font-medium border",
                      type === 'IN' ? "bg-green-900/30 text-green-400 border-green-900/50" :
                      type === 'OUT' ? "bg-red-900/30 text-red-400 border-red-900/50" :
                      "bg-blue-900/30 text-blue-400 border-blue-900/50"
                    )}>
                      {type === 'IN' ? 'รับเข้า (IN)' : type === 'OUT' ? 'เบิกออก (OUT)' : 'ปรับยอด (ADJUST)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-base font-medium text-slate-300 mb-2">วันที่</label>
              <input 
                type="date" 
                required
                className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-900 text-slate-100"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>

            {/* Drug Selection */}
            <div>
              <label className="block text-base font-medium text-slate-300 mb-2">เลือกยา</label>
              <select 
                required
                className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-900 text-slate-100"
                value={formData.drug_id}
                onChange={handleDrugChange}
              >
                <option value="">-- กรุณาเลือกยา --</option>
                {drugs.map(drug => (
                  <option key={drug.drug_id} value={drug.drug_id}>
                    {drug.drug_name} ({drug.drug_id})
                  </option>
                ))}
              </select>
            </div>

            {/* Lot No */}
            <div>
              <label className="block text-base font-medium text-slate-300 mb-2">Lot No</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-900 text-slate-100"
                value={formData.lot_no}
                onChange={(e) => setFormData({...formData, lot_no: e.target.value})}
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-base font-medium text-slate-300 mb-2">วันหมดอายุ</label>
              <input 
                type="date" 
                required
                className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-900 text-slate-100"
                value={formData.exp_date}
                onChange={(e) => setFormData({...formData, exp_date: e.target.value})}
              />
            </div>

            {/* Qty */}
            <div>
              <label className="block text-base font-medium text-slate-300 mb-2">จำนวน</label>
              <input 
                type="number" 
                required
                min="1"
                className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-900 text-slate-100"
                value={formData.qty}
                onChange={(e) => setFormData({...formData, qty: parseInt(e.target.value)})}
              />
            </div>

            {/* Pack Size */}
            <div>
              <label className="block text-base font-medium text-slate-300 mb-2">ขนาดบรรจุ (Pack Size)</label>
              <input 
                type="number" 
                required
                min="1"
                className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-900 text-slate-100"
                value={formData.pack_size}
                onChange={(e) => setFormData({...formData, pack_size: parseInt(e.target.value)})}
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-base font-medium text-slate-300 mb-2">ราคาต่อหน่วย</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-900 text-slate-100"
                value={formData.price_per_unit}
                onChange={(e) => setFormData({...formData, price_per_unit: parseFloat(e.target.value)})}
              />
            </div>

            {/* User */}
            <div>
              <label className="block text-base font-medium text-slate-300 mb-2">ผู้บันทึก</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-900 text-slate-100"
                value={formData.user}
                onChange={(e) => setFormData({...formData, user: e.target.value})}
              />
            </div>
            
            {/* Reason (for Adjust/Out) */}
            <div className="col-span-2">
               <label className="block text-base font-medium text-slate-300 mb-2">หมายเหตุ / สาเหตุ</label>
               <input 
                type="text" 
                className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-900 text-slate-100"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-700">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 text-slate-300 hover:bg-slate-700 rounded-xl transition-colors text-lg"
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50 text-lg font-medium shadow-lg shadow-teal-900/50"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              บันทึกรายการ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import TransactionModal from '@/components/TransactionModal';

export default function Transactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = () => {
    setLoading(true);
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
        setLoading(false);
      });
  };

  const filtered = transactions.filter(t => 
    t.drug_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.disp_no.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-slate-100">รายการรับเข้า/เบิกออก (Transactions)</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-900/50 text-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            เพิ่มรายการใหม่
          </button>
        </div>
      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTransactions}
      />

      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="ค้นหาชื่อยา หรือ เลขที่ใบเบิก (Disp No)..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-600 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-500 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-3 border border-slate-600 rounded-xl hover:bg-slate-700 text-slate-300 bg-slate-900">
              <Filter className="w-5 h-5" />
            </button>
            <button onClick={fetchTransactions} className="p-3 border border-slate-600 rounded-xl hover:bg-slate-700 text-slate-300 bg-slate-900">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-base text-left">
            <thead className="bg-slate-900 text-slate-400 font-medium uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">วันที่</th>
                <th className="px-6 py-4">เลขที่ใบเบิก</th>
                <th className="px-6 py-4">ประเภท</th>
                <th className="px-6 py-4">ชื่อยา</th>
                <th className="px-6 py-4">Lot No</th>
                <th className="px-6 py-4 text-right">จำนวน</th>
                <th className="px-6 py-4">ผู้บันทึก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500 text-lg">กำลังโหลด...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500 text-lg">ไม่พบข้อมูล</td></tr>
              ) : filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 text-slate-300">{format(new Date(tx.date), 'dd/MM/yyyy')}</td>
                  <td className="px-6 py-4 font-mono text-sm text-slate-400">{tx.disp_no}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
                      tx.transaction_type === 'IN' ? "bg-green-900/30 text-green-400 border border-green-900/50" :
                      tx.transaction_type === 'OUT' ? "bg-red-900/30 text-red-400 border border-red-900/50" :
                      "bg-blue-900/30 text-blue-400 border border-blue-900/50"
                    )}>
                      {tx.transaction_type === 'IN' ? <ArrowDownLeft className="w-4 h-4" /> : 
                       tx.transaction_type === 'OUT' ? <ArrowUpRight className="w-4 h-4" /> : 
                       <RefreshCw className="w-4 h-4" />}
                      {tx.transaction_type === 'IN' ? 'รับเข้า' : tx.transaction_type === 'OUT' ? 'เบิกออก' : 'ปรับยอด'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-200">{tx.drug_name}</td>
                  <td className="px-6 py-4 text-slate-400">{tx.lot_no}</td>
                  <td className={cn(
                    "px-6 py-4 text-right font-bold text-lg",
                    tx.qty > 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {tx.qty > 0 ? '+' : ''}{tx.qty}
                  </td>
                  <td className="px-6 py-4 text-slate-400">{tx.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  PackageX, 
  Activity,
  DollarSign
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';

const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
  <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-base font-medium text-slate-400">{title}</p>
        <h3 className="text-3xl font-bold text-slate-100 mt-2">{value}</h3>
        {subtext && <p className="text-sm text-slate-500 mt-1">{subtext}</p>}
      </div>
      <div className={`p-4 rounded-xl ${color} bg-opacity-20`}>
        <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-xl text-slate-400">กำลังโหลดข้อมูล...</div>;
  }

  const stockData = stats?.stockData || [];
  
  // Prepare chart data
  const expiryData = [
    { name: 'หมดอายุ', value: stats.expiredCount, color: '#EF4444' },
    { name: 'ใกล้หมด (<3ด)', value: stats.nearExp3Count, color: '#F59E0B' },
    { name: 'เฝ้าระวัง (3-6ด)', value: stats.nearExp3to6Count, color: '#3B82F6' },
    { name: 'ปกติ', value: stats.totalItems - (stats.expiredCount + stats.nearExp3Count + stats.nearExp3to6Count), color: '#10B981' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-100">ภาพรวม (Dashboard)</h2>
        <div className="text-base text-slate-400">
          ข้อมูลล่าสุด: {format(new Date(), 'dd MMM yyyy HH:mm')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="มูลค่าสต็อกรวม" 
          value={`฿${stats.totalValue.toLocaleString()}`} 
          subtext={`จำนวนทั้งหมด ${stats.totalItems} รายการ`}
          icon={DollarSign}
          color="bg-teal-500"
        />
        <StatCard 
          title="ยาหมดอายุ" 
          value={stats.expiredCount} 
          subtext="ต้องดำเนินการทันที"
          icon={AlertCircle}
          color="bg-red-500"
        />
        <StatCard 
          title="ยาใกล้หมดสต็อก" 
          value={stats.lowStockCount} 
          subtext="ต่ำกว่าจุดสั่งซื้อ (Min)"
          icon={TrendingUp}
          color="bg-amber-500"
        />
        <StatCard 
          title="ใกล้หมดอายุ (<3เดือน)" 
          value={stats.nearExp3Count} 
          subtext="วางแผนการใช้ด่วน"
          icon={Clock}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expiry Distribution */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 lg:col-span-1">
          <h3 className="text-xl font-semibold text-slate-100 mb-6">สถานะวันหมดอายุ</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expiryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expiryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                  itemStyle={{ color: '#f1f5f9' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {expiryData.map((item) => (
              <div key={item.name} className="flex items-center gap-3 text-base">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300">{item.name}: <span className="font-bold text-slate-100">{item.value}</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 lg:col-span-2">
          <h3 className="text-xl font-semibold text-slate-100 mb-6">แจ้งเตือนวิกฤต (Critical Alerts)</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {stockData.filter((i: any) => i.qty <= 0).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-red-900/20 rounded-xl border border-red-900/50 hover:bg-red-900/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-900/30 rounded-lg">
                    <PackageX className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-red-200">{item.drug_name}</p>
                    <p className="text-sm text-red-400">สินค้าหมด (Out of stock)</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-red-400">0</span>
              </div>
            ))}
            {stockData.filter((i: any) => i.qty < i.min_stock && i.qty > 0).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-amber-900/20 rounded-xl border border-amber-900/50 hover:bg-amber-900/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-amber-900/30 rounded-lg">
                    <Activity className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-amber-200">{item.drug_name}</p>
                    <p className="text-sm text-amber-400">ต่ำกว่าเกณฑ์ (Min: {item.min_stock})</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-amber-400">{item.qty}</span>
              </div>
            ))}
             {stockData.length === 0 && (
                <p className="text-slate-500 text-center py-8 text-lg">ไม่พบรายการแจ้งเตือน</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

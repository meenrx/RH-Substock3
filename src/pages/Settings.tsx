import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    line_token: '',
    email_report: '',
    hospital_name: 'Rueso Hospital'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(prev => ({ ...prev, ...data }));
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      alert('Settings saved');
    } catch (error) {
      console.error(error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-100">ตั้งค่าระบบ (Settings)</h2>

      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-8">
        <form onSubmit={handleSave} className="space-y-8 max-w-2xl">
          <div>
            <label className="block text-base font-medium text-slate-300 mb-2">ชื่อโรงพยาบาล</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-900 text-slate-100 text-lg"
              value={settings.hospital_name}
              onChange={(e) => setSettings({...settings, hospital_name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-base font-medium text-slate-300 mb-2">LINE Channel Access Token</label>
            <textarea 
              rows={4}
              className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono text-sm bg-slate-900 text-slate-100"
              value={settings.line_token}
              onChange={(e) => setSettings({...settings, line_token: e.target.value})}
              placeholder="วาง LINE Messaging API Token ที่นี่..."
            />
            <p className="text-sm text-slate-500 mt-2">ใช้สำหรับส่งการแจ้งเตือนยาใกล้หมดอายุและยาขาดสต็อก</p>
          </div>

          <div>
            <label className="block text-base font-medium text-slate-300 mb-2">อีเมลสำหรับรับรายงาน</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-900 text-slate-100 text-lg"
              value={settings.email_report}
              onChange={(e) => setSettings({...settings, email_report: e.target.value})}
              placeholder="report@hospital.com"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={saving}
              className="px-8 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors flex items-center gap-2 text-lg font-medium shadow-lg shadow-teal-900/50"
            >
              {saving && <Loader2 className="w-5 h-5 animate-spin" />}
              บันทึกการตั้งค่า
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

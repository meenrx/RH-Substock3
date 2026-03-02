import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Check, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function Import() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file: File) => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        // Transform data to match our schema
        // Assuming Excel columns: DrugID, DrugName, LotNo, ExpDate, Qty, PackSize, Price
        const transformed = jsonData.map((row: any) => ({
          drug_id: row['DrugID'] || row['รหัสยา'] || '',
          drug_name: row['DrugName'] || row['ชื่อยา'] || '',
          lot_no: row['LotNo'] || row['Lot'] || '',
          exp_date: row['ExpDate'] || row['วันหมดอายุ'] || '', // Need to handle date parsing carefully
          qty: row['Qty'] || row['จำนวน'] || 0,
          pack_size: row['PackSize'] || row['ขนาดบรรจุ'] || 1,
          price_per_unit: row['Price'] || row['ราคา'] || 0,
          selected: true
        }));

        setPreviewData(transformed);
        setStep(2);
      } catch (error) {
        console.error(error);
        alert('Error parsing file');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    setLoading(true);
    const selectedRows = previewData.filter(r => r.selected);
    
    const payload = selectedRows.map(row => ({
      ...row,
      date: new Date().toISOString().split('T')[0],
      user: 'Import',
      type: 'IN', // Default to IN for imports
      reason: 'Batch Import'
    }));

    try {
      const res = await fetch('/api/transactions/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert('Import successful!');
        navigate('/transactions');
      } else {
        alert('Import failed');
      }
    } catch (error) {
      console.error(error);
      alert('Error importing data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-100">นำเข้าข้อมูล (Import Transactions)</h2>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-8">
        <div className={cn("flex items-center gap-2", step >= 1 ? "text-teal-400" : "text-slate-600")}>
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg", step >= 1 ? "bg-teal-900/50 border border-teal-500" : "bg-slate-800 border border-slate-700")}>1</div>
          <span className="text-lg">อัปโหลดไฟล์</span>
        </div>
        <ArrowRight className="w-5 h-5 text-slate-600" />
        <div className={cn("flex items-center gap-2", step >= 2 ? "text-teal-400" : "text-slate-600")}>
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg", step >= 2 ? "bg-teal-900/50 border border-teal-500" : "bg-slate-800 border border-slate-700")}>2</div>
          <span className="text-lg">ตรวจสอบและยืนยัน</span>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-slate-800 p-16 rounded-xl shadow-lg border border-slate-700 text-center">
          <div className="w-20 h-20 bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-teal-900/50">
            <Upload className="w-10 h-10 text-teal-400" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-100 mb-3">อัปโหลดไฟล์ Excel</h3>
          <p className="text-slate-400 mb-8 text-lg">รองรับไฟล์นามสกุล .xlsx, .xls</p>
          
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-8 py-4 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium text-lg shadow-lg shadow-teal-900/50"
          >
            เลือกไฟล์จากเครื่อง
          </button>
          
          <div className="mt-10 text-base text-slate-500">
            <p>คอลัมน์ที่ต้องการ: DrugID, DrugName, LotNo, ExpDate, Qty, PackSize, Price</p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-slate-100">ข้อมูลตัวอย่าง ({previewData.length} รายการ)</h3>
            <div className="flex gap-3">
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-3 text-slate-300 hover:bg-slate-700 rounded-xl border border-slate-600"
              >
                ย้อนกลับ
              </button>
              <button 
                onClick={handleImport}
                disabled={loading}
                className="px-8 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-lg shadow-teal-900/50"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                ยืนยันการนำเข้า
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-base text-left">
              <thead className="bg-slate-900 text-slate-400 font-medium sticky top-0">
                <tr>
                  <th className="px-6 py-4 w-12">
                    <input type="checkbox" checked readOnly className="rounded border-slate-600 bg-slate-800 text-teal-600 focus:ring-teal-500" />
                  </th>
                  <th className="px-6 py-4">ชื่อยา</th>
                  <th className="px-6 py-4">Lot No</th>
                  <th className="px-6 py-4">วันหมดอายุ</th>
                  <th className="px-6 py-4 text-right">จำนวน</th>
                  <th className="px-6 py-4 text-right">ขนาดบรรจุ</th>
                  <th className="px-6 py-4 text-right">ราคา</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {previewData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-700/50">
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={row.selected} 
                        onChange={(e) => {
                          const newData = [...previewData];
                          newData[idx].selected = e.target.checked;
                          setPreviewData(newData);
                        }}
                        className="rounded border-slate-600 bg-slate-800 text-teal-600 focus:ring-teal-500"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">{row.drug_name}</td>
                    <td className="px-6 py-4 text-slate-400">{row.lot_no}</td>
                    <td className="px-6 py-4 text-slate-400">{row.exp_date}</td>
                    <td className="px-6 py-4 text-right font-medium text-green-400">{row.qty}</td>
                    <td className="px-6 py-4 text-right text-slate-400">{row.pack_size}</td>
                    <td className="px-6 py-4 text-right text-slate-400">{row.price_per_unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

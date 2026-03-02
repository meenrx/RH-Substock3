import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ArrowRightLeft, 
  FileText, 
  Settings, 
  Menu,
  X,
  Pill,
  AlertTriangle,
  ClipboardCheck,
  Upload
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const NavItem = ({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active: boolean }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-4 py-4 rounded-xl transition-colors text-lg",
      active 
        ? "bg-teal-600 text-white shadow-lg shadow-teal-900/50" 
        : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
    )}
  >
    <Icon className="w-6 h-6" />
    <span className="font-medium">{label}</span>
  </Link>
);

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const path = location.pathname;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-100 transition-transform duration-300 lg:translate-x-0 border-r border-slate-800",
        !isOpen && "-translate-x-full"
      )}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-900/50">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl leading-none text-slate-100">Sub-Stock</h1>
              <span className="text-sm text-slate-400">รพ.รือเสาะ</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <NavItem to="/" icon={LayoutDashboard} label="ภาพรวม (Dashboard)" active={path === '/'} />
          <NavItem to="/transactions" icon={ArrowRightLeft} label="รับเข้า/เบิกออก" active={path === '/transactions'} />
          <NavItem to="/import" icon={Upload} label="นำเข้า Excel" active={path === '/import'} />
          <NavItem to="/inventory" icon={Package} label="คลังยา (Inventory)" active={path === '/inventory'} />
          <NavItem to="/formulary" icon={FileText} label="บัญชีโรงพยาบาล" active={path === '/formulary'} />
          <NavItem to="/audit" icon={ClipboardCheck} label="สุ่มนับ (Audit)" active={path === '/audit'} />
          <NavItem to="/settings" icon={Settings} label="ตั้งค่า (Settings)" active={path === '/settings'} />
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <span className="font-bold text-sm text-teal-400">AD</span>
            </div>
            <div>
              <p className="text-base font-medium text-slate-200">ผู้ดูแลระบบ</p>
              <p className="text-sm text-slate-500">แผนกเภสัชกรรม</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

import React from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <header className="bg-slate-800 border-b border-slate-700 p-4 flex items-center gap-4 lg:hidden sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-200">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-xl text-slate-100">Sub-Stock รพ.รือเสาะ</h1>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

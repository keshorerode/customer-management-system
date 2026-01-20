"use client";

import { usePathname } from 'next/navigation';
import { Search, Bell, Plus, ChevronRight, Inbox } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Header() {
  const pathname = usePathname();
  const pathParts = pathname.split('/').filter(Boolean);
  const pageTitle = pathParts.length === 0 ? 'Dashboard' : pathParts[0];
  
  return (
    <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10 w-full transition-all">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
          <span className="hover:text-slate-600 cursor-pointer transition-colors">Workspace</span>
          <ChevronRight size={14} />
          <h2 className="text-slate-900 font-bold capitalize tracking-tight">{pageTitle}</h2>
        </div>
        
        <div className="h-6 w-[1px] bg-slate-200 hidden md:block" />
        
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search leads, people..." 
            className="input-field pl-10 w-80 h-9 bg-slate-50 border-transparent transition-all focus:bg-white focus:w-96"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 mr-2">
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all relative">
              <Inbox size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white" />
            </button>
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all relative">
              <Bell size={20} />
            </button>
        </div>

        <button className="btn-primary h-10 shadow-lg shadow-indigo-100 px-5">
          <Plus size={18} />
          <span className="font-semibold tracking-tight">Create Record</span>
        </button>
      </div>
    </header>
  );
}

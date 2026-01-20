"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Building2, 
  Target, 
  CheckSquare, 
  StickyNote, 
  LayoutDashboard,
  Settings,
  Mail,
  HelpCircle,
  LogOut,
  Mountain
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'People', path: '/people' },
  { icon: Building2, label: 'Companies', path: '/companies' },
  { icon: Mail, label: 'Leads', path: '/leads' },
  { icon: Target, label: 'Opportunities', path: '/opportunities' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: StickyNote, label: 'Notes', path: '/notes' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen border-r border-slate-200 flex flex-col fixed left-0 top-0 bg-white z-20">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white shadow-sm shadow-primary/30">
          <Mountain size={18} />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900 font-inter">WERSEL</span>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
        <p className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Main Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "sidebar-item",
                isActive && "active"
              )}
            >
              <item.icon size={18} className={cn(isActive ? "text-primary" : "text-slate-400")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="space-y-1 mb-4">
          <div className="sidebar-item">
            <HelpCircle size={18} className="text-slate-400" />
            <span>Support</span>
          </div>
          <div className="sidebar-item">
            <Settings size={18} className="text-slate-400" />
            <span>Settings</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white border border-slate-200 shadow-sm transition-all hover:border-primary/30 group cursor-pointer">
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-pink-100 flex items-center justify-center text-xs font-bold text-pink-600 border border-pink-200 group-hover:scale-105 transition-transform">
              JD
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-slate-900">John Doe</p>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">Admin</p>
          </div>
          <button className="p-1.5 text-slate-300 hover:text-red-500 rounded-md transition-colors opacity-0 group-hover:opacity-100">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

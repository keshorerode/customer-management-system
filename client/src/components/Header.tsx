"use client";

import { Search, Bell, HelpCircle, Plus } from "lucide-react";

export default function Header({ title }: { title: string }) {
  return (
    <header className="h-[64px] border-bottom border-border-main bg-bg-page/80 backdrop-blur-md sticky top-0 z-10 flex items-center px-8">
      <div className="text-sm font-semibold text-text-primary mr-8">
        {title}
      </div>

      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full bg-bg-surface border border-border-main rounded-md py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-primary transition-colors text-white"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-text-tertiary bg-bg-page px-1.5 py-0.5 rounded border border-border-main">
            CTRL+K
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 bg-brand-primary hover:bg-brand-accent text-white px-3 py-1.5 rounded-md text-sm font-semibold transition-colors">
          <Plus size={16} />
          <span>New Deal</span>
        </button>

        <div className="w-[1px] h-6 bg-border-main mx-2"></div>

        <button className="text-text-tertiary hover:text-text-primary transition-colors">
          <Bell size={20} />
        </button>
        <button className="text-text-tertiary hover:text-text-primary transition-colors">
          <HelpCircle size={20} />
        </button>
      </div>
    </header>
  );
}

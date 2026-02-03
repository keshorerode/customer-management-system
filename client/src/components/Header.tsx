"use client";

import { Search, Bell, HelpCircle, Plus, Menu } from "lucide-react";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="h-[64px] border-b border-border-main bg-bg-page/80 backdrop-blur-md sticky top-0 z-30 flex items-center px-4 md:px-8 gap-4">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={onMenuClick}
        className="lg:hidden text-text-tertiary hover:text-white p-1"
      >
        <Menu size={20} />
      </button>

      <div className="text-sm font-semibold text-text-primary hidden md:block whitespace-nowrap">
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
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="flex items-center gap-2 bg-brand-primary hover:bg-brand-accent text-white px-3 py-1.5 rounded-md text-sm font-semibold transition-colors">
          <Plus size={16} />
          <span className="hidden sm:inline">New Deal</span>
        </button>

        <div className="hidden sm:block w-[1px] h-6 bg-border-main mx-1"></div>

        <button className="text-text-tertiary hover:text-text-primary transition-colors hidden xs:block">
          <Bell size={20} />
        </button>
        <button className="text-text-tertiary hover:text-text-primary transition-colors hidden sm:block">
          <HelpCircle size={20} />
        </button>
      </div>
    </header>
  );
}

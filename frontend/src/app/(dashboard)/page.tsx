"use client";

import React from 'react';
import { Users, Mail, Target, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Total Leads', value: '124', change: '+12%', trendingUp: true, icon: Mail, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Active Contacts', value: '1,240', change: '+4%', trendingUp: true, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Opportunities', value: '$45,200', change: '-2%', trendingUp: false, icon: Target, color: 'text-rose-600', bg: 'bg-rose-50' },
];

const recentActivity = [
  { id: 1, user: 'John Doe', action: 'sent a reply to', target: 'Alice Johnson', time: '2 mins ago', type: 'mail' },
  { id: 2, user: 'System', action: 'synced 12 new threads from', target: 'Gmail', time: '15 mins ago', type: 'sync' },
  { id: 3, user: 'Sarah Miller', action: 'moved', target: 'TechCorp Lead', time: '1 hour ago', type: 'lead' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Morning, John</h1>
          <p className="text-sm text-slate-500 font-medium">Here's what's happening with your workspace today.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Clock size={14} className="text-indigo-500" />
            <span>LAST SYNC: 2 MINS AGO</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            whileHover={{ y: -4 }}
            key={i} 
            className="card p-6 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-black uppercase tracking-widest ${stat.trendingUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.change}
                {stat.trendingUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Performance Chart Placeholder */}
        <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 leading-none">
                    <TrendingUp size={14} className="text-indigo-500" /> Revenue Growth
                </h2>
                <div className="flex gap-2">
                    {['1W', '1M', '1Y'].map(t => (
                        <button key={t} className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${t === '1M' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-400 hover:text-slate-900'}`}>{t}</button>
                    ))}
                </div>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 h-80 flex flex-col justify-end relative overflow-hidden group">
                <div className="absolute inset-0 bg-slate-50/50 flex flex-col items-center justify-center gap-3">
                    <div className="p-4 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 animate-pulse">
                        <TrendingUp size={48} className="text-indigo-100" />
                    </div>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Chart data processing...</p>
                </div>
                {/* Visual Placeholder for Graph */}
                <div className="flex items-end justify-between gap-1 relative z-10 opacity-30 group-hover:opacity-50 transition-opacity h-32">
                    {[40, 70, 45, 90, 65, 80, 55, 95, 75, 40, 60, 85].map((h, i) => (
                        <div key={i} className="flex-1 bg-indigo-100 rounded-t-lg transition-transform hover:scale-y-110 origin-bottom" style={{ height: `${h}%` }}></div>
                    ))}
                </div>
            </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-4 space-y-4">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 leading-none px-2">
                <Clock size={14} className="text-indigo-500" /> Recent Activity
            </h2>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-50">
                {recentActivity.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors group">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                <CheckCircle2 size={14} className="text-indigo-400 opacity-50 group-hover:opacity-100 group-hover:text-indigo-600 transition-all" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-600 leading-normal">
                                    <span className="font-black text-slate-900 underline decoration-slate-200 underline-offset-2">{activity.user}</span> {activity.action} <span className="font-bold text-indigo-600">{activity.target}</span>
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{activity.time}</p>
                            </div>
                        </div>
                    </div>
                ))}
                <button className="w-full py-4 text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest bg-slate-50/30 transition-colors">
                    View All Activity
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

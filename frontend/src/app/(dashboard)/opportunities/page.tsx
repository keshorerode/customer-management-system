"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Plus, Building2, MoreHorizontal, Filter, Download, DollarSign, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Opportunity {
    id: string;
    name: string;
    amount: number;
    stage: string;
    closeDate: string;
    company?: { id: string; name: string };
    pointOfContact?: { id: string; firstName: string; lastName: string };
}

export default function OpportunitiesPage() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOpportunities();
    }, []);

    const fetchOpportunities = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/opportunities');
            setOpportunities(response.data);
        } catch (error) {
            console.error('Error fetching opportunities:', error);
            if (opportunities.length === 0) {
                 setOpportunities([
                    { id: '1', name: 'Q3 Software Upgrade', amount: 50000, stage: 'Proposal', closeDate: new Date().toISOString(), company: { id: '1', name: 'TechCorp' } },
                    { id: '2', name: 'Consulting Retainer', amount: 12000, stage: 'Negotiation', closeDate: new Date().toISOString(), company: { id: '2', name: 'Acme Inc' } },
                    { id: '3', name: 'Website Redesign', amount: 8500, stage: 'New', closeDate: new Date().toISOString(), company: { id: '3', name: 'Nexus Hub' } },
                 ]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getStageColor = (stage: string) => {
        switch (stage.toLowerCase()) {
            case 'new': return 'bg-blue-100 text-blue-700';
            case 'proposal': return 'bg-purple-100 text-purple-700';
            case 'negotiation': return 'bg-orange-100 text-orange-700';
            case 'won': return 'bg-green-100 text-green-700';
            case 'lost': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Opportunities</h1>
                    <p className="text-sm text-slate-500 font-medium">Manage your deals and pipeline.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn-secondary h-10 px-4">
                        <Download size={16} />
                        <span>Export</span>
                    </button>
                    <button className="btn-primary h-10 px-5">
                        <Plus size={18} />
                        <span>Add Deal</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                     <div className="flex items-center gap-4">
                        <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden">
                            <Target size={14} />
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{opportunities.length} Deals in Pipeline</p>
                    </div>
                    <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                        <Filter size={18} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/20">
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Opportunity Name</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Company</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Value</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Stage</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Est. Close</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {opportunities.map((opp) => (
                                    <motion.tr
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        key={opp.id}
                                        className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/80 cursor-pointer transition-all duration-200"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900">{opp.name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {opp.company ? (
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                                    <Building2 size={12} className="text-slate-400" />
                                                    {opp.company.name}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">No Company</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
                                                <DollarSign size={12} className="text-slate-400" />
                                                {opp.amount?.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${getStageColor(opp.stage)}`}>
                                                {opp.stage}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                             <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                                <Calendar size={12} className="text-slate-400" />
                                                {opp.closeDate ? new Date(opp.closeDate).toLocaleDateString() : '-'}
                                             </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

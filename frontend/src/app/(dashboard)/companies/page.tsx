"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Search, Filter, Download, Plus, Users, Target, MoreHorizontal, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CompanyDetailDrawer from '@/components/CompanyDetailDrawer';
import CompanyFormDrawer from '@/components/CompanyFormDrawer';
import Link from 'next/link';

interface Company {
  id: string;
  name: string;
  domainName: string;
  employees: number;
  linkedinLink: string;
  xLink: string;
  createdAt: string;
  people?: any[];
  opportunities?: any[];
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      if (companies.length === 0) {
        setCompanies([
            { id: '1', name: 'TechCorp', domainName: 'techcorp.com', employees: 1500, linkedinLink: '', xLink: '', createdAt: new Date().toISOString() },
            { id: '2', name: 'Acme Inc', domainName: 'acme.inc', employees: 50, linkedinLink: '', xLink: '', createdAt: new Date().toISOString() },
            { id: '3', name: 'Nexus Hub', domainName: 'nexushub.io', employees: 250, linkedinLink: '', xLink: '', createdAt: new Date().toISOString() },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = (savedCompany: Company) => {
      setCompanies(prev => {
          const exists = prev.find(c => c.id === savedCompany.id);
          if (exists) {
              return prev.map(c => c.id === savedCompany.id ? savedCompany : c);
          }
          return [savedCompany, ...prev];
      });
      setIsFormOpen(false);
      setEditingCompany(null);
  };

  const handleEdit = () => {
      setEditingCompany(selectedCompany);
      setSelectedCompany(null);
      setIsFormOpen(true);
  };

  const openNewCompanyForm = () => {
      setEditingCompany(null);
      setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Companies</h1>
          <p className="text-sm text-slate-500 font-medium">Manage your target accounts and organizations.</p>
        </div>
        <div className="flex items-center gap-2">
            <button className="btn-secondary h-10 px-4">
                <Download size={16} />
                <span>Export</span>
            </button>
            <button 
                onClick={openNewCompanyForm}
                className="btn-primary h-10 px-5"
            >
                <Plus size={18} />
                <span>Add Company</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-4">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden">
                            <Building2 size={14} />
                        </div>
                    ))}
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{companies.length} Companies Found</p>
            </div>
            <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                <Filter size={18} />
            </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/20">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Company Name</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Size</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Website</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Links</th>
                 <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {companies.map((company) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={company.id}
                    onClick={() => setSelectedCompany(company)}
                    className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/80 cursor-pointer transition-all duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                          {company.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-none mb-1">{company.name}</p>
                          <p className="text-[11px] text-slate-400 font-medium">Created {new Date(company.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Users size={14} className="text-indigo-400" />
                            {company.employees || 0} Employees
                        </div>
                    </td>
                    <td className="px-6 py-4">
                         <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                             <Globe size={12} className="text-slate-400" />
                            {company.domainName}
                         </div>
                    </td>
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                             {/* Placeholder for social links if available in list view */}
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

       <CompanyDetailDrawer 
            company={selectedCompany} 
            onClose={() => setSelectedCompany(null)} 
            onEdit={handleEdit}
        />
        
        <CompanyFormDrawer
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSave={handleSave}
            initialData={editingCompany}
        />
    </div>
  );
}

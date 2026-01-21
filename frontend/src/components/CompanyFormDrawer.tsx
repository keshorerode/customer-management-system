import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Save, User, Plus, Target, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface CompanyFormData {
  name: string;
  domainName: string;
  employees: number;
  linkedinLink: string;
  xLink: string;
  people: { firstName: string; lastName: string; jobTitle: string; email: string }[];
  opportunities: { name: string; amount: number; stage: string }[];
}

interface CompanyFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: any) => void;
  initialData?: any;
}

export default function CompanyFormDrawer({ isOpen, onClose, onSave, initialData }: CompanyFormDrawerProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    domainName: '',
    employees: 0,
    linkedinLink: '',
    xLink: '',
    people: [],
    opportunities: []
  });

  const [activeSection, setActiveSection] = useState<'details' | 'people' | 'opportunities'>('details');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        domainName: initialData.domainName || '',
        employees: initialData.employees || 0,
        linkedinLink: initialData.linkedinLink || '',
        xLink: initialData.xLink || '',
        people: initialData.people || [],
        opportunities: initialData.opportunities || [],
      });
    } else {
        setFormData({
            name: '',
            domainName: '',
            employees: 0,
            linkedinLink: '',
            xLink: '',
            people: [],
            opportunities: []
        });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Helper to update nested arrays
  const handleNestedChange = (index: number, field: string, value: any, type: 'people' | 'opportunities') => {
      setFormData(prev => {
          const newArray = [...prev[type]];
          newArray[index] = { ...newArray[index], [field]: value };
          return { ...prev, [type]: newArray };
      });
  };

  const addItem = (type: 'people' | 'opportunities') => {
      setFormData(prev => ({
          ...prev,
          [type]: [
              ...prev[type],
              type === 'people' 
                  ? { firstName: '', lastName: '', jobTitle: '', email: '' }
                  : { name: '', amount: 0, stage: 'New' }
          ]
      }));
  };

  const removeItem = (index: number, type: 'people' | 'opportunities') => {
      setFormData(prev => ({
          ...prev,
          [type]: prev[type].filter((_, i) => i !== index)
      }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      if (initialData?.id) {
        response = await axios.patch(`http://localhost:3001/api/companies/${initialData.id}`, formData);
      } else {
        response = await axios.post('http://localhost:3001/api/companies', formData);
      }
      onSave(response.data);
      onClose();
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl"
          >
             <div className="p-6 pb-2 border-b border-slate-100 bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        {initialData ? 'Edit Company' : 'New Company'}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {/* Navigation Pits */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                    {['details', 'people', 'opportunities'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveSection(tab as any)}
                            className={cn(
                                "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                                activeSection === tab 
                                    ? "bg-white text-indigo-600 shadow-sm" 
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/30">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* DETAILS SECTION */}
                    {activeSection === 'details' && (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                             <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Company Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input 
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Acme Inc"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium text-slate-900 placeholder:text-slate-400 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Domain</label>
                                <input 
                                    type="text"
                                    name="domainName"
                                    value={formData.domainName}
                                    onChange={handleChange}
                                    placeholder="e.g. acme.com"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium text-slate-900 placeholder:text-slate-400 transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Employees</label>
                                <input 
                                    type="number"
                                    name="employees"
                                    value={formData.employees}
                                    onChange={handleChange}
                                    placeholder="e.g. 50"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium text-slate-900 placeholder:text-slate-400 transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">LinkedIn URL</label>
                                <input 
                                    type="url"
                                    name="linkedinLink"
                                    value={formData.linkedinLink}
                                    onChange={handleChange}
                                    placeholder="https://linkedin.com/company/..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium text-slate-900 placeholder:text-slate-400 transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Twitter/X URL</label>
                                <input 
                                    type="url"
                                    name="xLink"
                                    value={formData.xLink}
                                    onChange={handleChange}
                                    placeholder="https://twitter.com/..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium text-slate-900 placeholder:text-slate-400 transition-all"
                                />
                            </div>
                        </div>
                    )}

                    {/* PEOPLE SECTION */}
                    {activeSection === 'people' && (
                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                             {formData.people.map((person, index) => (
                                 <div key={index} className="p-4 bg-white border border-slate-200 rounded-xl relative group">
                                     <button 
                                        type="button" 
                                        onClick={() => removeItem(index, 'people')}
                                        className="absolute top-2 right-2 text-slate-300 hover:text-red-500"
                                     >
                                         <Trash2 size={16} />
                                     </button>
                                     <div className="space-y-3">
                                         <div className="grid grid-cols-2 gap-3">
                                            <input 
                                                type="text"
                                                placeholder="First Name"
                                                value={person.firstName}
                                                onChange={(e) => handleNestedChange(index, 'firstName', e.target.value, 'people')}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-500"
                                            />
                                            <input 
                                                type="text"
                                                placeholder="Last Name"
                                                value={person.lastName}
                                                onChange={(e) => handleNestedChange(index, 'lastName', e.target.value, 'people')}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-500"
                                            />
                                         </div>
                                         <input 
                                            type="text"
                                            placeholder="Job Title"
                                            value={person.jobTitle}
                                            onChange={(e) => handleNestedChange(index, 'jobTitle', e.target.value, 'people')}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-500"
                                        />
                                         <input 
                                            type="email"
                                            placeholder="Email Address"
                                            value={person.email}
                                            onChange={(e) => handleNestedChange(index, 'email', e.target.value, 'people')}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-500"
                                        />
                                     </div>
                                 </div>
                             ))}
                             <button
                                type="button"
                                onClick={() => addItem('people')}
                                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                             >
                                 <Plus size={16} /> Add Person
                             </button>
                        </div>
                    )}

                    {/* OPPORTUNITIES SECTION */}
                    {activeSection === 'opportunities' && (
                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                             {formData.opportunities.map((opp, index) => (
                                 <div key={index} className="p-4 bg-white border border-slate-200 rounded-xl relative group">
                                     <button 
                                        type="button" 
                                        onClick={() => removeItem(index, 'opportunities')}
                                        className="absolute top-2 right-2 text-slate-300 hover:text-red-500"
                                     >
                                         <Trash2 size={16} />
                                     </button>
                                     <div className="space-y-3">
                                        <input 
                                            type="text"
                                            placeholder="Opportunity Name"
                                            value={opp.name}
                                            onChange={(e) => handleNestedChange(index, 'name', e.target.value, 'opportunities')}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-500"
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="relative">
                                                <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
                                                <input 
                                                    type="number"
                                                    placeholder="Value"
                                                    value={opp.amount}
                                                    onChange={(e) => handleNestedChange(index, 'amount', Number(e.target.value), 'opportunities')}
                                                    className="w-full pl-6 pr-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-500"
                                                />
                                            </div>
                                            <select
                                                value={opp.stage}
                                                onChange={(e) => handleNestedChange(index, 'stage', e.target.value, 'opportunities')}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-500 bg-white"
                                            >
                                                <option value="New">New</option>
                                                <option value="Discovery">Discovery</option>
                                                <option value="Proposal">Proposal</option>
                                                <option value="Negotiation">Negotiation</option>
                                                <option value="Won">Won</option>
                                            </select>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                             <button
                                type="button"
                                onClick={() => addItem('opportunities')}
                                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                             >
                                 <Plus size={16} /> Add Opportunity
                             </button>
                        </div>
                    )}

                    <div className="pt-4 border-t border-slate-100">
                        <button 
                            type="submit" 
                            className="btn-primary w-full h-12 flex items-center justify-center gap-2 font-black uppercase tracking-widest shadow-indigo-100"
                        >
                            <Save size={18} />
                            {initialData ? 'Save Changes' : 'Create Company'}
                        </button>
                    </div>
                </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

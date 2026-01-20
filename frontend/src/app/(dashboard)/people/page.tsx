"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Phone, MapPin, MoreHorizontal, Linkedin, Twitter, Plus, X, Building2, Briefcase, User, Filter, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  city: string;
  avatarUrl: string;
  company?: { name: string };
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/people');
      setPeople(response.data);
    } catch (error) {
      console.error('Error fetching people:', error);
      // Fallback with dummy data if needed
      if (people.length === 0) {
        setPeople([
            { id: '1', firstName: 'Alice', lastName: 'Johnson', email: 'alice@techcorp.com', phone: '+1 234 567 890', jobTitle: 'Product Manager', city: 'San Francisco', avatarUrl: '', company: { name: 'TechCorp' } },
            { id: '2', firstName: 'Bob', lastName: 'Smith', email: 'bob@acme.inc', phone: '+1 987 654 321', jobTitle: 'Software Engineer', city: 'New York', avatarUrl: '', company: { name: 'Acme Inc' } },
            { id: '3', firstName: 'Charlie', lastName: 'Davis', email: 'charlie@nexus.hub', phone: '+1 345 678 901', jobTitle: 'Design Lead', city: 'Austin', avatarUrl: '', company: { name: 'Nexus Hub' } },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">People</h1>
          <p className="text-sm text-slate-500 font-medium">Manage and organize your contact network.</p>
        </div>
        <div className="flex items-center gap-2">
            <button className="btn-secondary h-10 px-4">
                <Download size={16} />
                <span>Export</span>
            </button>
            <button className="btn-primary h-10 px-5">
                <Plus size={18} />
                <span>Add Person</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden">
                            <User size={14} />
                        </div>
                    ))}
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{people.length} Contacts Found</p>
            </div>
            <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                <Filter size={18} />
            </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/20">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Identity</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Occupation</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Communication</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Region</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {people.map((person) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={person.id}
                    onClick={() => setSelectedPerson(person)}
                    className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/80 cursor-pointer transition-all duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                          {person.firstName[0]}{person.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-none mb-1">{person.firstName} {person.lastName}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                            <Building2 size={10} />
                            <span>{person.company?.name || 'Independent'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Briefcase size={14} className="text-indigo-400" />
                            {person.jobTitle}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">
                          <Mail size={12} /> {person.email}
                        </div>
                        <div className="flex items-center gap-2 text-[12px] font-medium text-slate-400">
                          <Phone size={12} /> {person.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <MapPin size={12} className="text-rose-400" /> {person.city}
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

      {/* Modern Person Detail Drawer */}
      <AnimatePresence>
        {selectedPerson && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPerson(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-screen w-full max-w-md bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="p-8 pb-10 border-b border-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 transition-all blur-3xl"></div>
                <div className="flex justify-between items-start relative z-10">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-200 animate-in zoom-in-50 duration-500">
                        {selectedPerson.firstName[0]}{selectedPerson.lastName[0]}
                    </div>
                    <button 
                        onClick={() => setSelectedPerson(null)} 
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="mt-6 relative z-10">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">{selectedPerson.firstName} {selectedPerson.lastName}</h2>
                  <p className="text-sm font-bold text-indigo-600 bg-indigo-50 inline-block px-3 py-1 rounded-full uppercase tracking-widest">{selectedPerson.jobTitle}</p>
                  <p className="text-slate-400 text-xs font-bold flex items-center gap-1.5 mt-3 opacity-80 uppercase tracking-widest">
                    <Building2 size={12} /> WORKS AT {selectedPerson.company?.name || 'Self-Employed'}
                  </p>
                </div>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10 bg-slate-50/30">
                <section>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-5 pl-1 flex items-center gap-2">
                    <User size={12} className="text-indigo-400" /> Professional Profiles
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2.5 h-12 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group outline-none">
                      <Linkedin size={18} className="text-[#0a66c2]" />
                      <span className="text-xs font-black text-slate-700 uppercase tracking-widest">LinkedIn</span>
                    </button>
                    <button className="flex items-center justify-center gap-2.5 h-12 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/5 transition-all group outline-none">
                      <Twitter size={18} className="text-[#1da1f2]" />
                      <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Twitter</span>
                    </button>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-1 flex items-center gap-2">
                    <Mail size={12} className="text-indigo-400" /> Touchpoints
                  </h3>
                  <div className="space-y-3">
                    <div className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-300 transition-all">
                      <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform"><Mail size={20} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Primary Email</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{selectedPerson.email}</p>
                      </div>
                    </div>
                    <div className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-300 transition-all">
                      <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform"><Phone size={20} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Direct Line</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{selectedPerson.phone}</p>
                      </div>
                    </div>
                    <div className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-300 transition-all">
                      <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform"><MapPin size={20} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Primary Location</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{selectedPerson.city}</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Drawer Action Footer */}
              <div className="p-6 border-t border-slate-100 bg-white grid grid-cols-2 gap-4">
                <button className="btn-secondary h-12 flex items-center justify-center font-black uppercase tracking-widest text-[11px]">Edit Detail</button>
                <button className="btn-primary h-12 flex items-center justify-center font-black uppercase tracking-widest text-[11px] shadow-indigo-100">Send Pulse</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, User, Target, Link as LinkIcon, Linkedin, Twitter, Globe, MapPin, Calendar, CheckSquare, StickyNote, FileText, MoreHorizontal, Home, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for classes
function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface Company {
  id: string;
  name?: string;
  domainName?: string;
  employees?: number;
  linkedinLink?: string;
  xLink?: string;
  address?: string;
  people?: any[];
  opportunities?: any[];
  tasks?: any[];
  notes?: any[];
  createdAt: string;
}

interface CompanyDetailDrawerProps {
  company: Company | null;
  onClose: () => void;
  onEdit: () => void;
}

export default function CompanyDetailDrawer({ company, onClose, onEdit }: CompanyDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'notes'>('home');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteBody, setNewNoteBody] = useState('');
  const [localCompany, setLocalCompany] = useState<Company | null>(company);

  // Sync prop changes to local state, so ui updates immediately on prop change
  React.useEffect(() => {
      setLocalCompany(company);
  }, [company]);

  const handleCreateTask = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!localCompany || !newTaskTitle.trim()) return;

      try {
          const res = await axios.post('http://localhost:3001/api/tasks', {
              title: newTaskTitle,
              company: { id: localCompany.id },
              status: 'TODO'
          });
          setLocalCompany(prev => prev ? ({ ...prev, tasks: [res.data, ...(prev.tasks || [])] }) : null);
          setNewTaskTitle('');
      } catch (err) {
          console.error(err);
      }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
      e.preventDefault();
       if (!localCompany || !newNoteTitle.trim()) return;

       try {
          const res = await axios.post('http://localhost:3001/api/notes', {
              title: newNoteTitle,
              body: newNoteBody,
              company: { id: localCompany.id }
          });
          setLocalCompany(prev => prev ? ({ ...prev, notes: [res.data, ...(prev.notes || [])] }) : null);
          setNewNoteTitle('');
          setNewNoteBody('');
       } catch (err) {
           console.error(err);
       }
  };

  if (!localCompany) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-screen w-full max-w-md bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl"
      >
        {/* Header Section */}
        <div className="px-6 pt-6 pb-2 border-b border-slate-100 bg-white">
            <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-lg font-black text-white shadow-lg shadow-indigo-200">
                      {localCompany.name?.[0] || 'C'}
                    </div>
                    <div>
                         <h2 className="text-lg font-black text-slate-900 leading-tight">{localCompany.name}</h2>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Created now</p>
                    </div>
                 </div>
                 <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                     <X size={20} />
                 </button>
            </div>
            
            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => setActiveTab('home')}
                  className={cn("px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2", activeTab === 'home' ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}
                >
                    <Home size={14} /> Home
                </button>
                 <button 
                  onClick={() => setActiveTab('tasks')}
                  className={cn("px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2", activeTab === 'tasks' ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}
                >
                    <CheckSquare size={14} /> Tasks
                </button>
                 <button 
                  onClick={() => setActiveTab('notes')}
                  className={cn("px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2", activeTab === 'notes' ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}
                >
                    <StickyNote size={14} /> Notes
                </button>
                 <button className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all flex items-center gap-2">
                    <FileText size={14} /> Files
                </button>
            </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 p-6">
            
            {/* HOME TAB */}
            {activeTab === 'home' && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                    <div className="space-y-4">
                         
                         {/* Address Field */}
                         <div className="group flex items-start gap-4">
                            <div className="w-24 mt-0.5 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <MapPin size={12} /> Address
                            </div>
                            <div className="flex-1">
                                <span className={cn("text-sm font-medium", localCompany.address ? "text-slate-900" : "text-slate-400 italic")}>
                                    {localCompany.address || 'London, United Kingdom'}
                                </span>
                            </div>
                         </div>

                         {/* ARR Field */}
                         <div className="group flex items-start gap-4">
                            <div className="w-24 mt-0.5 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <div className="w-3 h-3 rounded-full border border-slate-300 flex items-center justify-center text-[8px] font-sans">$</div> ARR
                            </div>
                            <div className="flex-1">
                                <span className="text-sm font-medium text-slate-400 italic">
                                    Click to add...
                                </span>
                            </div>
                         </div>

                         {/* Created By Field */}
                         <div className="group flex items-start gap-4">
                            <div className="w-24 mt-0.5 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <User size={12} /> Created by
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                     <div className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-[9px] font-bold">JD</div>
                                     <span className="text-sm font-medium text-slate-900">John Doe</span>
                                </div>
                            </div>
                         </div>

                         {/* Domain Field */}
                         <div className="group flex items-start gap-4">
                            <div className="w-24 mt-0.5 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <LinkIcon size={12} /> Domain
                            </div>
                            <div className="flex-1">
                                <a href={`https://${localCompany.domainName}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:underline">
                                    {localCompany.domainName || '-'}
                                </a>
                            </div>
                         </div>
                         
                         {/* Employees Field */}
                         <div className="group flex items-start gap-4">
                            <div className="w-24 mt-0.5 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <User size={12} /> Employees
                            </div>
                            <div className="flex-1">
                                <span className="text-sm font-medium text-slate-900">{localCompany.employees || 0}</span>
                            </div>
                         </div>

                         {/* LinkedIn Field */}
                        <div className="group flex items-start gap-4">
                            <div className="w-24 mt-0.5 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <Linkedin size={12} /> Linkedin
                            </div>
                            <div className="flex-1">
                                 {localCompany.linkedinLink ? (
                                    <a href={localCompany.linkedinLink} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:underline truncate block">
                                        {localCompany.linkedinLink}
                                    </a>
                                 ) : (
                                     <span className="text-sm text-slate-400 italic">No link</span>
                                 )}
                            </div>
                         </div>

                         {/* Last Update */}
                         <div className="group flex items-start gap-4">
                            <div className="w-24 mt-0.5 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <Calendar size={12} /> Updated
                            </div>
                            <div className="flex-1">
                                <span className="text-sm font-medium text-slate-900">less than a minute ago</span>
                            </div>
                         </div>

                    </div>
                </div>
            )}

            {/* TASKS TAB */}
            {activeTab === 'tasks' && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                     <form onSubmit={handleCreateTask} className="relative">
                        <input 
                            type="text" 
                            placeholder="Add a task..." 
                            className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-medium"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                        />
                         <button type="submit" className="absolute right-2 top-2 p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                             <Plus size={18} />
                         </button>
                     </form>

                     <div className="space-y-2">
                         {localCompany.tasks && localCompany.tasks.length > 0 ? (
                             localCompany.tasks.map((task: any) => (
                                 <div key={task.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-all">
                                      <div className={cn("w-5 h-5 rounded border flex items-center justify-center cursor-pointer", task.status === 'DONE' ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 hover:border-indigo-500")}>
                                          {task.status === 'DONE' && <CheckSquare size={12} />}
                                      </div>
                                      <span className={cn("text-sm font-medium text-slate-900", task.status === 'DONE' && "line-through text-slate-400")}>{task.title}</span>
                                 </div>
                             ))
                         ) : (
                             <div className="text-center py-10">
                                 <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-2">
                                     <CheckSquare size={20} />
                                 </div>
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">No tasks yet</p>
                             </div>
                         )}
                     </div>
                </div>
            )}

             {/* NOTES TAB */}
             {activeTab === 'notes' && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                     <form onSubmit={handleCreateNote} className="space-y-2 p-3 bg-white rounded-xl border border-slate-200 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                        <input 
                            type="text" 
                            placeholder="Note title..." 
                            className="w-full text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none"
                            value={newNoteTitle}
                            onChange={(e) => setNewNoteTitle(e.target.value)}
                        />
                        <textarea
                            placeholder="Write something..."
                            className="w-full text-sm font-medium text-slate-600 placeholder:text-slate-300 outline-none resize-none h-20"
                             value={newNoteBody}
                            onChange={(e) => setNewNoteBody(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <button type="submit" className="text-xs font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">Save Note</button>
                        </div>
                     </form>

                     <div className="space-y-3">
                         {localCompany.notes && localCompany.notes.length > 0 ? (
                             localCompany.notes.map((note: any) => (
                                 <div key={note.id} className="p-4 bg-yellow-50/50 border border-yellow-200 rounded-xl hover:shadow-sm transition-all relative group">
                                      <h4 className="text-sm font-bold text-slate-900 mb-1">{note.title}</h4>
                                      <p className="text-xs text-slate-600 leading-relaxed max-w-[90%]">{note.body}</p>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-2">{new Date(note.createdAt).toLocaleDateString()}</p>
                                      <button className="absolute top-2 right-2 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <MoreHorizontal size={16} />
                                      </button>
                                 </div>
                             ))
                         ) : (
                             <div className="text-center py-10">
                                 <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-2">
                                     <StickyNote size={20} />
                                 </div>
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">No notes yet</p>
                             </div>
                         )}
                     </div>
                </div>
            )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
             <span>ID: {localCompany.id.substring(0, 8)}...</span>
             <button onClick={onEdit} className="text-indigo-600 hover:text-indigo-700 hover:underline">Edit Full Record</button>
        </div>

      </motion.div>
    </AnimatePresence>
  );
}

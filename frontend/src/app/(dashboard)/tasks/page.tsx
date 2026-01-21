"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckSquare, Plus, Calendar, Building2, MoreHorizontal, Filter, Download, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Task {
    id: string;
    title: string;
    body: string;
    status: string;
    dueAt: string;
    company?: { id: string; name: string };
    createdAt: string;
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/tasks');
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            if (tasks.length === 0) {
                 setTasks([
                    { id: '1', title: 'Follow up call', body: 'Discuss Q3 plans', status: 'TODO', dueAt: new Date().toISOString(), company: { id: '1', name: 'TechCorp' }, createdAt: new Date().toISOString() },
                    { id: '2', title: 'Send proposal', body: 'Finalize pricing', status: 'IN_PROGRESS', dueAt: new Date().toISOString(), company: { id: '2', name: 'Acme Inc' }, createdAt: new Date().toISOString() },
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
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tasks</h1>
                    <p className="text-sm text-slate-500 font-medium">Track your to-dos and follow-ups.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn-secondary h-10 px-4">
                        <Download size={16} />
                        <span>Export</span>
                    </button>
                    <button className="btn-primary h-10 px-5">
                        <Plus size={18} />
                        <span>Add Task</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                     <div className="flex items-center gap-4">
                        <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden">
                            <CheckSquare size={14} />
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{tasks.length} Tasks Pending</p>
                    </div>
                    <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                        <Filter size={18} />
                    </button>
                </div>

                <div className="grid gap-4 p-4">
                    {tasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-all group">
                             <div className="flex items-center gap-4">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer ${task.status === 'DONE' ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 hover:border-indigo-500'}`}>
                                    {task.status === 'DONE' && <CheckSquare size={14} className="text-white" />}
                                </div>
                                <div>
                                    <p className={`text-sm font-bold text-slate-900 ${task.status === 'DONE' ? 'line-through text-slate-400' : ''}`}>{task.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                         {task.company && (
                                            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                                <Building2 size={10} /> {task.company.name}
                                            </span>
                                         )}
                                          {task.dueAt && (
                                            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                                                <Calendar size={10} /> {new Date(task.dueAt).toLocaleDateString()}
                                            </span>
                                         )}
                                    </div>
                                </div>
                             </div>
                             <button className="p-2 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all">
                                <MoreHorizontal size={18} />
                             </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

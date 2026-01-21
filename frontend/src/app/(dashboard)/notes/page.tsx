"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StickyNote, Plus, Building2, MoreHorizontal, Filter, Download } from 'lucide-react';

interface Note {
    id: string;
    title: string;
    body: string;
    company?: { id: string; name: string };
    createdAt: string;
}

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/notes');
            setNotes(response.data);
        } catch (error) {
             // Fallback
             if (notes.length === 0) {
                 setNotes([
                     { id: '1', title: 'Meeting Key Takeaways', body: 'Client is interested in the premium plan...', company: { id: '1', name: 'TechCorp' }, createdAt: new Date().toISOString() },
                     { id: '2', title: 'Competitor Analysis', body: 'They are using...', company: { id: '2', name: 'Acme Inc' }, createdAt: new Date().toISOString() },
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
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notes</h1>
                    <p className="text-sm text-slate-500 font-medium">Capture ideas and meeting logs.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn-secondary h-10 px-4">
                        <Download size={16} />
                        <span>Export</span>
                    </button>
                    <button className="btn-primary h-10 px-5">
                        <Plus size={18} />
                        <span>Add Note</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {notes.map(note => (
                     <div key={note.id} className="bg-yellow-50/50 border border-yellow-200 p-6 rounded-2xl relative group hover:shadow-lg transition-all hover:-translate-y-1">
                         <div className="flex justify-between items-start mb-4">
                             {note.company ? (
                                 <span className="text-[10px] font-black uppercase tracking-widest text-yellow-600/70 flex items-center gap-1">
                                    <Building2 size={10} /> {note.company.name}
                                 </span>
                             ) : <span></span>}
                             <button className="text-yellow-600/40 hover:text-yellow-700">
                                 <MoreHorizontal size={18} />
                             </button>
                         </div>
                         <h3 className="text-lg font-bold text-slate-900 mb-2">{note.title}</h3>
                         <p className="text-sm text-slate-600 leading-relaxed font-medium">{note.body}</p>
                         <div className="mt-4 pt-4 border-t border-yellow-200/50 text-[10px] font-bold text-yellow-600/50 uppercase tracking-widest">
                             {new Date(note.createdAt).toLocaleDateString()}
                         </div>
                     </div>
                 ))}
            </div>
        </div>
    );
}

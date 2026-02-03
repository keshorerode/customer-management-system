"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Loader2, StickyNote, Trash2, Calendar, Pencil } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import SlideOver from "@/components/SlideOver";
import LoadingSpinner from "@/components/LoadingSpinner";
import Combobox from "@/components/Combobox";

interface Note {
  id?: string;
  _id?: string;
  content: string;
  related_to_type: string;
  related_to_id: string;
  createdAt?: string;
}

export default function NotesPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    content: "",
    related_to_type: "",
    related_to_id: ""
  });
  const [formError, setFormError] = useState("");
  
  const queryClient = useQueryClient();

  // 1. Fetch Notes
  const { data: notes, isLoading, isError, error } = useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: async () => {
      const response = await api.get("/notes/");
      return response.data;
    }
  });

  // 2. Fetch Companies & People for Relation
  const { data: companies } = useQuery<Array<{id: string, _id?: string, name: string}>>({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await api.get("/companies/");
      return response.data;
    }
  });
  
  const { data: people } = useQuery<Array<{id: string, _id?: string, first_name: string, last_name: string}>>({
    queryKey: ["people"],
    queryFn: async () => {
      const response = await api.get("/people/");
      return response.data;
    }
  });

  // 3. Create/Update Note Mutation
  const noteMutation = useMutation({
    mutationFn: (data: Partial<Note>) => {
      if (selectedNote) {
        const noteId = selectedNote.id || selectedNote._id;
        return api.put(`/notes/${noteId}`, data);
      }
      return api.post("/notes/", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      closeDrawer();
    },
    onError: (err: unknown) => {
      setFormError(getErrorMessage(err));
    }
  });

  // 4. Delete Note Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    }
  });

  const openDrawer = (note?: Note) => {
    if (note) {
      setSelectedNote(note);
      setFormData({
        content: note.content,
        related_to_type: note.related_to_type,
        related_to_id: note.related_to_id
      });
    } else {
      setSelectedNote(null);
      setFormData({ content: "", related_to_type: "company", related_to_id: "" });
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedNote(null);
    setFormError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    noteMutation.mutate(formData);
  };

  const getNameForRelated = (type: string, id: string) => {
    if (type === 'company') {
      return companies?.find(c => (c.id || c._id) === id)?.name || "Unknown Company";
    } else if (type === 'person') {
      const p = people?.find(p => (p.id || p._id) === id);
      return p ? `${p.first_name} ${p.last_name}` : "Unknown Person";
    }
    return "Unknown";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Notes</h1>
          <p className="text-text-secondary text-sm">Capture details, meetings, and ideas</p>
        </div>
        <button 
          onClick={() => openDrawer()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add Note
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-bg-surface border border-border-main p-4 rounded-card flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
          <input 
            type="text" 
            placeholder="Search notes content..." 
            className="w-full bg-bg-page border border-border-input text-text-primary pl-10 pr-4 py-2 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm shadow-sm"
          />
        </div>
        <button className="w-full sm:w-auto btn-ghost border border-border-main flex items-center justify-center gap-2 shadow-sm">
          <Filter size={16} />
          Filters
        </button>
      </div>

      {/* List View */}
      <div className="space-y-6">
        {isLoading ? (
          <LoadingSpinner message="Loading notes..." />
        ) : isError ? (
          <div className="p-8 bg-danger/10 border border-danger/20 rounded-card text-center">
            <p className="text-danger font-bold">Failed to load notes</p>
            <p className="text-text-secondary text-sm mt-1">{getErrorMessage(error)}</p>
            <button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ["notes"] })}
              className="mt-4 text-brand-primary hover:underline text-sm font-bold"
            >
              Try again
            </button>
          </div>
        ) : (!notes || notes.filter(n => n && (n.id || n._id)).length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border-main rounded-card">
            <div className="p-4 bg-brand-primary/10 rounded-full text-brand-primary mb-4 p-6">
              <StickyNote size={48} />
            </div>
            <h3 className="text-xl font-bold text-text-primary">No notes yet</h3>
            <p className="text-text-secondary mt-2">Start capturing your thoughts and meeting details.</p>
            <button 
              onClick={() => openDrawer()}
              className="mt-6 btn-primary px-8"
            >
              Create Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes?.filter(n => n && (n.id || n._id)).map((note) => (
              <div key={note.id || note._id} className="bg-bg-surface border border-border-main rounded-card p-6 hover:border-brand-primary/40 transition-all group relative flex flex-col h-full">
                <div className="absolute top-4 right-4 flex gap-1 transition-opacity opacity-0 group-hover:opacity-100">
                    <button 
                      onClick={() => openDrawer(note)}
                      className="p-1 hover:text-brand-primary text-text-tertiary transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        const noteId = note.id || note._id;
                        if (noteId && confirm("Delete this note?")) deleteMutation.mutate(noteId);
                      }}
                      className="p-1 hover:text-danger text-text-tertiary transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                    note.related_to_type === 'company' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {note.related_to_type}
                  </span>
                  <span className="text-xs text-text-secondary font-medium truncate max-w-[150px]">
                    {getNameForRelated(note.related_to_type, note.related_to_id)}
                  </span>
                </div>
                
                <p className="text-text-primary text-sm whitespace-pre-wrap flex-1 line-clamp-6">
                  {note.content}
                </p>

                <div className="mt-4 pt-4 border-t border-border-main flex items-center text-text-tertiary text-xs">
                  <Calendar size={12} className="mr-1" />
                  {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Just now'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SlideOver Form */}
      <SlideOver 
        isOpen={isDrawerOpen} 
        onClose={closeDrawer}
        title={selectedNote ? "Edit Note" : "Add Note"}
        description={selectedNote ? "Update note details" : "Create a new note"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="p-3 bg-danger/10 border border-danger text-danger text-xs rounded">
              {formError}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Related Type</label>
                <select 
                  value={formData.related_to_type}
                  onChange={(e) => setFormData({...formData, related_to_type: e.target.value, related_to_id: ""})}
                  className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
                >
                  <option value="company">Company</option>
                  <option value="person">Person</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
                  {formData.related_to_type === 'company' ? 'Select Company' : 'Select Person'}
                </label>
                <Combobox 
                  options={formData.related_to_type === 'company' 
                    ? (companies ? companies.filter(c => c && (c.id || c._id)).map(c => ({ id: c.id || c._id || "", label: c.name })) : [])
                    : (people ? people.filter(p => p && (p.id || p._id)).map(p => ({ id: p.id || p._id || "", label: `${p.first_name} ${p.last_name}` })) : [])
                  }
                  value={formData.related_to_id}
                  onChange={(val) => setFormData({...formData, related_to_id: val})}
                  placeholder={formData.related_to_type === 'company' ? "Search for a company..." : "Search for a person..."}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Note Content</label>
              <textarea 
                required
                rows={8}
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Type your note here..." 
                className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm resize-none"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-border-main flex gap-3">
            <button 
              type="button"
              onClick={closeDrawer}
              className="flex-1 btn-ghost border border-border-main font-bold"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={noteMutation.isPending}
              className="flex-1 btn-primary font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {noteMutation.isPending && <Loader2 className="animate-spin" size={18} />}
              {noteMutation.isPending ? "Saving..." : (selectedNote ? "Update Note" : "Save Note")}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}

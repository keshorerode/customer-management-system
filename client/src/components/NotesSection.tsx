"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Plus, Trash2, Loader2, Pin } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";

interface Note {
  id?: string;
  _id?: string; // Handle both id formats
  title?: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
}

interface NotesSectionProps {
  relatedToType: string;
  relatedToId: string;
}

export default function NotesSection({ relatedToType, relatedToId }: NotesSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const queryClient = useQueryClient();

  // Fetch Notes
  const { data: notes, isLoading, isError, refetch } = useQuery<Note[]>({
    queryKey: ["notes", relatedToType, relatedToId],
    queryFn: async () => {
      if (!relatedToId) return [];
      const response = await api.get(`/notes/?related_to_type=${relatedToType}&related_to_id=${relatedToId}`);
      return response.data;
    },
    enabled: !!relatedToId,
    retry: 1
  });

  // Create Note Mutation
  const createMutation = useMutation({
    mutationFn: (data: { content: string; related_to_type: string; related_to_id: string; is_pinned: boolean }) => api.post("/notes/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", relatedToType, relatedToId] });
      setNewNoteContent("");
      setIsAdding(false);
    }
  });

  // Delete Note Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", relatedToType, relatedToId] });
    }
  });

  // Toggle Pin Mutation (Update)
  const togglePinMutation = useMutation({
    mutationFn: ({ id, is_pinned }: { id: string, is_pinned: boolean }) => 
      api.put(`/notes/${id}`, { is_pinned }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", relatedToType, relatedToId] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    createMutation.mutate({
      content: newNoteContent,
      related_to_type: relatedToType,
      related_to_id: relatedToId,
      is_pinned: false
    });
  };

  if (!relatedToId) return null;

  return (
    <div className="space-y-4 pt-4 border-t border-border-main">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
          <MessageCircle size={14} />
          Notes
        </h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs text-brand-primary hover:text-brand-accent font-bold flex items-center gap-1 transition-colors bg-brand-primary/10 px-3 py-1 rounded-full"
        >
          <Plus size={14} />
          Add Note
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-bg-muted border border-border-input rounded-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200 shadow-inner">
          <textarea
            autoFocus
            rows={3}
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Write a note..."
            className="w-full bg-transparent text-text-primary text-sm focus:outline-none placeholder:text-text-tertiary resize-none"
          />
          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="text-xs text-text-tertiary hover:text-text-secondary px-3 py-1.5 rounded-full transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={createMutation.isPending || !newNoteContent.trim()}
              className="text-xs bg-brand-primary text-white hover:bg-brand-accent px-4 py-1.5 rounded-full font-bold transition-colors disabled:opacity-50 flex items-center gap-1 shadow-sm"
            >
              {createMutation.isPending && <Loader2 size={12} className="animate-spin" />}
              Save
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 size={20} className="text-brand-primary animate-spin" />
        </div>
      ) : isError ? (
        <div className="text-center py-6 text-danger text-xs border border-dashed border-danger/30 rounded-2xl bg-danger/5">
          <p className="mb-2">Failed to load notes</p>
          <button 
            onClick={() => refetch()}
            className="text-xs bg-danger/10 text-danger hover:bg-danger/20 px-3 py-1.5 rounded-full font-bold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : notes?.length === 0 && !isAdding ? (
        <div className="text-center py-8 text-text-tertiary text-xs border border-dashed border-border-main rounded-2xl bg-bg-muted/30">
          No notes yet
        </div>
      ) : (
        <div className="space-y-4">
          {notes?.sort((a, b) => (Number(b.is_pinned) - Number(a.is_pinned))).map((note) => {
             const noteId = note.id || note._id;
             if (!noteId) return null;
             return (
              <div key={noteId} className={`group relative p-4 rounded-2xl border text-sm transition-all shadow-sm ${note.is_pinned ? 'bg-yellow-50 border-yellow-200' : 'bg-bg-surface border-border-main hover:border-brand-primary/20'}`}>
                <div className="text-text-primary whitespace-pre-wrap leading-relaxed">{note.content}</div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-text-tertiary font-medium">
                  <span className="bg-bg-muted px-2 py-0.5 rounded-full">{new Date(note.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => togglePinMutation.mutate({ id: noteId, is_pinned: !note.is_pinned })}
                      className={`p-1.5 hover:bg-bg-muted rounded-full ${note.is_pinned ? 'text-yellow-600' : 'hover:text-text-primary'}`}
                      title={note.is_pinned ? "Unpin note" : "Pin note"}
                    >
                      <Pin size={12} fill={note.is_pinned ? "currentColor" : "none"} />
                    </button>
                    <button 
                      onClick={() => deleteMutation.mutate(noteId)}
                      className="p-1.5 hover:bg-danger/10 text-text-tertiary hover:text-danger rounded-full"
                      title="Delete note"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreVertical, CheckSquare, Loader2, Calendar, Clock } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import SlideOver from "@/components/SlideOver";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: string;
  status: string;
  related_company_id?: string;
}

export default function TasksPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "Medium",
    status: "Todo",
    related_company_id: ""
  });
  const [formError, setFormError] = useState("");
  
  const queryClient = useQueryClient();

  // 1. Fetch Tasks
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await api.get("/tasks/");
      return response.data;
    }
  });

  // 2. Fetch Companies
  const { data: companies } = useQuery<any[]>({
    queryKey: ["companies-list"],
    queryFn: async () => {
      const response = await api.get("/companies/");
      return response.data;
    }
  });

  // 3. Create Task Mutation
  const createTask = useMutation({
    mutationFn: (newTask: any) => api.post("/tasks/", newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setIsDrawerOpen(false);
      setFormData({ title: "", description: "", due_date: "", priority: "Medium", status: "Todo", related_company_id: "" });
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.detail || "Failed to create task");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    createTask.mutate(formData);
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'Urgent': return 'text-danger bg-danger/10 border-danger/20';
      case 'High': return 'text-warning bg-warning/10 border-warning/20';
      case 'Medium': return 'text-brand-primary bg-brand-primary/10 border-brand-primary/20';
      default: return 'text-text-tertiary bg-white/5 border-white/10';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Tasks</h1>
          <p className="text-text-secondary text-sm">Organize your workflow and follow-ups</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="bg-brand-primary hover:bg-brand-accent text-white px-4 py-2 rounded-md font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-primary/20 transform active:scale-[0.98]"
        >
          <Plus size={18} />
          Add Task
        </button>
      </div>

      {/* List View */}
      <div className="space-y-6">
        {isLoading ? (
          <LoadingSpinner message="Loading tasks..." />
        ) : (!tasks || tasks.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border-main rounded-card">
            <div className="p-4 bg-white/5 rounded-full text-text-tertiary mb-4">
              <CheckSquare size={32} />
            </div>
            <h3 className="text-white font-bold">No tasks yet</h3>
            <p className="text-text-secondary text-sm mt-1">Create your first task to stay organized.</p>
          </div>
        ) : (
          <div className="bg-bg-surface border border-border-main rounded-card overflow-hidden">
            {tasks?.map((task, i) => (
              <div key={task.id} className={`p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group ${i !== 0 ? 'border-t border-border-main' : ''}`}>
                <div className="w-5 h-5 rounded border border-border-input flex items-center justify-center cursor-pointer hover:border-brand-primary transition-colors">
                  <div className="w-2.5 h-2.5 bg-brand-primary rounded-sm opacity-0 group-hover:opacity-20" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-white truncate">{task.title}</h3>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5">
                    {task.due_date && (
                      <div className="flex items-center gap-1.5 text-text-tertiary">
                        <Calendar size={12} />
                        <span className="text-[11px]">{new Date(task.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {task.related_company_id && (
                      <div className="flex items-center gap-1.5 text-brand-primary">
                        <Clock size={12} />
                        <span className="text-[11px] font-medium truncate max-w-[150px]">
                          {companies?.find(c => c.id === task.related_company_id)?.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button className="text-text-tertiary hover:text-white transition-colors p-2">
                  <MoreVertical size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SlideOver Form */}
      <SlideOver 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title="Add New Task"
        description="Create a task to stay on top of your work"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="p-3 bg-danger/10 border border-danger text-danger text-xs rounded">
              {formError}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Task Title</label>
              <input 
                required
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Follow up on proposal" 
                className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Priority</label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Due Date</label>
                <input 
                  type="date" 
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Related Company</label>
              <select 
                value={formData.related_company_id}
                onChange={(e) => setFormData({...formData, related_company_id: e.target.value})}
                className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
              >
                <option value="">None</option>
                {companies?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Description</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Add any additional details here..." 
                className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm resize-none"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-border-main flex gap-3">
            <button 
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-md transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={createTask.isPending}
              className="flex-1 bg-brand-primary hover:bg-brand-accent text-white font-bold py-3 rounded-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {createTask.isPending && <Loader2 className="animate-spin" size={18} />}
              {createTask.isPending ? "Creating..." : "Save Task"}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}

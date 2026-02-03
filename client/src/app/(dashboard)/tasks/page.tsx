"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Filter, MoreVertical, Calendar, CheckSquare, Loader2, Building2 } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    priority: "Medium",
    due_date: "",
    related_company_id: "",
    description: ""
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

  // 2. Create/Update Task Mutation
  const taskMutation = useMutation({
    mutationFn: (data: any) => {
      if (selectedTask) {
        return api.put(`/tasks/${selectedTask.id}`, data);
      }
      return api.post("/tasks/", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      closeDrawer();
    },
    onError: (err: any) => {
      setFormError(getErrorMessage(err));
    }
  });

  // 3. Delete Task Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });

  const openDrawer = (task?: Task) => {
    if (task) {
      setSelectedTask(task);
      setFormData({
        title: task.title,
        priority: task.priority || "Medium",
        due_date: task.due_date ? task.due_date.split('T')[0] : "",
        related_company_id: task.related_company_id || "",
        description: task.description || ""
      });
    } else {
      setSelectedTask(null);
      setFormData({ title: "", priority: "Medium", due_date: "", related_company_id: "", description: "" });
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTask(null);
    setFormError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    taskMutation.mutate(formData);
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
          onClick={() => openDrawer()}
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
              <div key={task.id} className="bg-bg-surface border border-border-main rounded-card p-5 hover:border-brand-primary/40 transition-all group relative">
              <div className="flex items-center gap-4">
                <button className="w-6 h-6 rounded-full border-2 border-border-main hover:border-brand-primary transition-colors flex items-center justify-center group/check">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-primary scale-0 group-hover/check:scale-100 transition-transform"></div>
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white group-hover:text-brand-primary transition-colors truncate">{task.title}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5 text-text-tertiary">
                      <Calendar size={14} />
                      <span className="text-xs">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}</span>
                    </div>
                    {task.related_company_id && (
                      <div className="flex items-center gap-1.5 text-text-tertiary">
                        <Building2 size={14} />
                        <span className="text-xs">Linked</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                    task.priority === 'High' ? 'bg-danger/10 text-danger' : 
                    task.priority === 'Medium' ? 'bg-warning/10 text-warning' : 
                    'bg-success/10 text-success'
                  }`}>
                    {task.priority}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openDrawer(task)}
                      className="p-1 hover:text-brand-primary text-text-tertiary transition-colors"
                    >
                      <Filter size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Delete ${task.title}?`)) deleteMutation.mutate(task.id);
                      }}
                      className="p-1 hover:text-danger text-text-tertiary transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
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
        title={selectedTask ? "Edit Task" : "Add New Task"}
        description={selectedTask ? "Update task details" : "Keep track of your to-dos"}
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
              onClick={closeDrawer}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-md transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={taskMutation.isPending}
              className="flex-1 bg-brand-primary hover:bg-brand-accent text-white font-bold py-3 rounded-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {taskMutation.isPending && <Loader2 className="animate-spin" size={18} />}
              {taskMutation.isPending ? "Saving..." : (selectedTask ? "Update Task" : "Save Task")}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}

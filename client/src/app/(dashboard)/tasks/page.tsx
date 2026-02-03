"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Calendar, CheckSquare, Loader2, Building2, Search, Filter, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import SlideOver from "@/components/SlideOver";
import LoadingSpinner from "@/components/LoadingSpinner";
import Combobox from "@/components/Combobox";

interface Task {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: string;
  status: string;
  related_to_type?: string;
  related_to_id?: string;
}

export default function TasksPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    priority: "Medium",
    due_date: "",
    related_to_type: "",
    related_to_id: "",
    description: ""
  });
  const [formError, setFormError] = useState("");
  
  const queryClient = useQueryClient();

  // 1. Fetch Tasks
  const { data: tasks, isLoading, isError, error } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await api.get("/tasks/");
      return response.data;
    }
  });

  // 2. Fetch Companies
  const { data: companies } = useQuery<Array<{id: string, _id?: string, name: string}>>({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await api.get("/companies/");
      return response.data;
    }
  });

  // 2. Create/Update Task Mutation
  const taskMutation = useMutation({
    mutationFn: (data: Partial<Task>) => {
      if (selectedTask) {
        const taskId = selectedTask.id || selectedTask._id;
        return api.put(`/tasks/${taskId}`, data);
      }
      return api.post("/tasks/", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      closeDrawer();
    },
    onError: (err: unknown) => {
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
        related_to_type: task.related_to_type || "",
        related_to_id: task.related_to_id || "",
        description: task.description || ""
      });
    } else {
      setSelectedTask(null);
      setFormData({ title: "", priority: "Medium", due_date: "", related_to_type: "", related_to_id: "", description: "" });
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


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Tasks</h1>
          <p className="text-text-secondary text-sm">Organize your workflow and follow-ups</p>
        </div>
        <button 
          onClick={() => openDrawer()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add Task</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-bg-surface border border-border-main p-4 rounded-card flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full bg-bg-page border border-border-input text-text-primary pl-10 pr-4 py-2 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm shadow-sm"
          />
        </div>
        <button className="w-full sm:w-auto btn-ghost border border-border-main flex items-center justify-center gap-2 shadow-sm">
          <Filter size={16} />
          Filters
        </button>
      </div>

      {/* List View */}
      <div className="space-y-6 flex-1 flex flex-col min-h-0">
        {isLoading ? (
          <LoadingSpinner message="Loading tasks..." />
        ) : isError ? (
          <div className="p-8 bg-danger/10 border border-danger/20 rounded-card text-center">
            <p className="text-danger font-bold">Failed to load tasks</p>
            <p className="text-text-secondary text-sm mt-1">{getErrorMessage(error)}</p>
            <button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ["tasks"] })}
              className="mt-4 text-brand-primary hover:underline text-sm font-bold"
            >
              Try again
            </button>
          </div>
        ) : (!tasks || tasks.filter(t => t && (t.id || t._id)).length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border-main rounded-card">
            <div className="p-4 bg-brand-primary/10 rounded-full text-brand-primary mb-4">
              <CheckSquare size={32} />
            </div>
            <h3 className="text-text-primary font-bold">No tasks yet</h3>
            <p className="text-text-secondary text-sm mt-1">Create your first task to stay organized.</p>
          </div>
        ) : (
          <div className="bg-bg-surface border border-border-main rounded-card overflow-hidden flex flex-col">
            <div className="overflow-y-auto max-h-[calc(100vh-220px)] p-2">
              <div className="space-y-2">
                {tasks?.filter(t => t && (t.id || t._id)).map((task) => (
                  <div key={task.id || task._id} className="bg-bg-surface border border-border-main rounded-card p-4 hover:border-brand-primary/40 transition-all group relative">
                    <div className="flex items-center gap-4">
                      <button className="w-6 h-6 rounded-full border-2 border-border-main hover:border-brand-primary transition-colors flex items-center justify-center group/check flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-primary scale-0 group-hover/check:scale-100 transition-transform"></div>
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-text-primary group-hover:text-brand-primary transition-colors truncate">{task.title}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1.5 text-text-tertiary">
                            <Calendar size={14} />
                            <span className="text-xs">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}</span>
                          </div>
                          {task.related_to_type === 'company' && (
                            <div className="flex items-center gap-1.5 text-text-tertiary">
                              <Building2 size={14} />
                              <span className="text-xs">
                                {companies?.find(c => (c.id || c._id) === task.related_to_id)?.name || "Linked"}
                              </span>
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
                        <div className="flex items-center gap-1 transition-opacity">
                          <button 
                            onClick={() => openDrawer(task)}
                            className="p-1 hover:text-brand-primary text-text-tertiary transition-colors"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              const taskId = task.id || task._id;
                              if (taskId && confirm(`Delete ${task.title}?`)) deleteMutation.mutate(taskId);
                            }}
                            className="p-1 hover:text-danger text-text-tertiary transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Priority</label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
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
                  className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Related Company</label>
              <Combobox 
                options={companies ? companies.filter(c => c && (c.id || c._id)).map(c => ({ 
                  id: c.id || c._id || "", 
                  label: c.name 
                })) : []}
                value={formData.related_to_id}
                onChange={(val) => {
                  setFormData({
                    ...formData, 
                    related_to_id: val,
                    related_to_type: val ? 'company' : ''
                  });
                }}
                placeholder="Search for a company..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Description</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Add any additional details here..." 
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
              disabled={taskMutation.isPending}
              className="flex-1 btn-primary font-bold flex items-center justify-center gap-2 disabled:opacity-50"
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

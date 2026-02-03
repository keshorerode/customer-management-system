"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Calendar, CheckSquare, Loader2, Building2, Search, Filter, Pencil, Trash2, UserCircle, AlertCircle, Clock, Grip, ArrowRight, LayoutGrid } from "lucide-react";
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
  created_at?: string;
}

const TASK_STATUS_OPTIONS = ["To Do", "In Progress", "Blocked", "Done"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"];

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<'landing' | 'timeline'>('landing');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    priority: "Medium",
    status: "To Do",
    due_date: "",
    related_to_type: "",
    related_to_id: "",
    description: ""
  });
  const [formError, setFormError] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

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

  // 3. Fetch People
  const { data: people } = useQuery<Array<{id: string, _id?: string, first_name: string, last_name: string}>>({
    queryKey: ["people"],
    queryFn: async () => {
      const response = await api.get("/people/");
      return response.data;
    }
  });

  // 4. Fetch Deals (for Landing View)
  const { data: deals } = useQuery<Array<{id: string, _id?: string, title: string}>>({
      queryKey: ["deals"],
      queryFn: async () => {
          const response = await api.get("/deals/");
          return response.data;
      }
  });

  // 5. Fetch Products (for Landing View)
  const { data: products } = useQuery<Array<{id: string, _id?: string, name: string}>>({
      queryKey: ["products"],
      queryFn: async () => {
          const response = await api.get("/products/");
          return response.data;
      }
  });

  // Create/Update Task Mutation
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

  // Delete Task Mutation
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
        status: task.status || "To Do",
        due_date: task.due_date ? task.due_date.split('T')[0] : "",
        related_to_type: task.related_to_type || "",
        related_to_id: task.related_to_id || "",
        description: task.description || ""
      });
    } else {
      setSelectedTask(null);
      setFormData({ 
        title: "", 
        priority: "Medium", 
        status: "To Do",
        due_date: "", 
        related_to_type: "", 
        related_to_id: "", 
        description: "" 
      });
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

  // Helper Functions
  const getBadgeColor = (type: string, value: string) => {
    if (type === 'priority') {
      switch(value) {
        case 'Critical': return 'bg-danger/10 text-danger border-danger/20';
        case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'Medium': return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
        default: return 'bg-bg-muted text-text-secondary border-border-main';
      }
    } else { // status
      switch(value) {
        case 'Done': return 'bg-success/10 text-success border-success/20';
        case 'Blocked': return 'bg-danger/10 text-danger border-danger/20';
        case 'In Progress': return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
        default: return 'bg-bg-muted text-text-secondary border-border-main';
      }
    }
  };

  const getWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0-6
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Monday
    const monday = new Date(today);
    monday.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        days.push(d);
    }
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear();
  };

  const isThisWeek = (date: Date) => {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      return date > today && date <= nextWeek;
  };

  const isOverdue = (date: Date) => {
      const today = new Date();
      today.setHours(0,0,0,0);
      return date < today;
  };

  // Grouping Logic
  const filteredTasks = tasks?.filter(t => {
      if (filterPriority !== "All" && t.priority !== filterPriority) return false;
      if (filterStatus !== "All" && (t.status || "To Do") !== filterStatus) return false;
      return true;
  }) || [];

  const groupedTasks = {
      overdue: [] as Task[],
      today: [] as Task[],
      tomorrow: [] as Task[],
      thisWeek: [] as Task[],
      later: [] as Task[],
      noDate: [] as Task[]
  };

  filteredTasks.forEach(task => {
      if (!task.due_date) {
          groupedTasks.noDate.push(task);
          return;
      }
      const d = new Date(task.due_date);
      const checkDate = new Date(d);
      checkDate.setHours(0,0,0,0);

      if (isOverdue(checkDate) && task.status !== 'Done') {
          groupedTasks.overdue.push(task);
      } else if (isToday(checkDate)) {
          groupedTasks.today.push(task);
      } else if (isTomorrow(checkDate)) {
          groupedTasks.tomorrow.push(task);
      } else if (isThisWeek(checkDate)) {
          groupedTasks.thisWeek.push(task);
      } else {
          groupedTasks.later.push(task);
      }
  });

  const renderTaskCard = (task: Task) => (
    <div key={task.id || task._id} className="bg-bg-surface border border-border-main rounded-card p-4 hover:border-brand-primary/40 transition-all group relative shadow-sm mb-3 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <UserCircle size={18} />
            </div>
            <div>
                <h3 className="font-bold text-text-primary text-sm line-clamp-1">{task.title}</h3>
                {task.related_to_type === 'company' && (
                    <div className="flex items-center gap-1 text-[11px] text-text-secondary">
                        <Building2 size={10} />
                        <span>{companies?.find(c => (c.id || c._id) === task.related_to_id)?.name || "Project"}</span>
                    </div>
                )}
            </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getBadgeColor('priority', task.priority)}`}>
            {task.priority || 'Medium'}
        </span>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-main/50">
        <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getBadgeColor('status', task.status || 'To Do')}`}>
                {task.status || 'To Do'}
            </span>
            {task.due_date && (
                <div className={`flex items-center gap-1 text-[11px] ${isOverdue(new Date(task.due_date)) && task.status !== 'Done' ? 'text-danger font-bold' : 'text-text-tertiary'}`}>
                    <Calendar size={12} />
                    <span>{new Date(task.due_date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                </div>
            )}
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
                onClick={() => openDrawer(task)}
                className="p-1.5 hover:bg-bg-muted rounded text-text-tertiary hover:text-brand-primary transition-colors"
                title="Edit"
            >
                <Pencil size={14} />
            </button>
            <button 
                onClick={() => {
                    const taskId = task.id || task._id;
                    if (taskId && confirm(`Delete ${task.title}?`)) deleteMutation.mutate(taskId);
                }}
                className="p-1.5 hover:bg-bg-muted rounded text-text-tertiary hover:text-danger transition-colors"
                title="Delete"
            >
                <Trash2 size={14} />
            </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 h-full flex flex-col animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tasks</h1>
          <p className="text-text-secondary text-xs">{viewMode === 'landing' ? 'By company' : 'Timeline View'}</p>
        </div>
        <div className="flex gap-3">
             <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
                <input 
                    type="text" 
                    placeholder="Search tasks..." 
                    className="bg-bg-surface border border-border-input text-text-primary pl-9 pr-4 py-1.5 rounded-full text-sm focus:outline-none focus:border-brand-primary shadow-sm w-48 transition-all focus:w-64"
                />
            </div>
            <button onClick={() => openDrawer()} className="btn-primary flex items-center gap-2 px-4 py-1.5 text-sm">
                <Plus size={16} />
                <span className="hidden sm:inline">New Task</span>
            </button>
            <button className="btn-ghost border border-border-main px-3 text-sm font-bold">
                Bulk Actions
            </button>
        </div>
      </div>

     {viewMode === 'landing' ? (
         <div className="flex-1 overflow-y-auto pt-4 relative">
             <div className="absolute top-0 left-0">
                  <Grip size={20} className="text-text-tertiary opacity-50 mb-4" />
             </div>
             <div className="bg-bg-surface border border-border-main rounded-xl p-6 shadow-sm max-w-lg mt-8">
                 <div className="space-y-4">
                     <div className="flex items-center gap-3">
                         <span className="text-sm font-bold text-text-secondary w-20">Task by</span>
                         <div className="flex flex-wrap gap-2">
                            {companies?.slice(0, 5).map((comp, i) => (
                                <button key={i} onClick={() => setViewMode('timeline')} className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity">
                                    {comp.name}
                                </button>
                            ))}
                            {(!companies || companies.length === 0) && (
                                <button onClick={() => setViewMode('timeline')} className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity">
                                    company
                                </button>
                            )}
                         </div>
                     </div>
                     <div className="flex items-center gap-3">
                         <span className="text-sm font-bold text-text-secondary w-20">Task by</span>
                         <div className="flex flex-wrap gap-2">
                             {deals?.slice(0, 5).map((deal, i) => (
                                 <button key={i} onClick={() => setViewMode('timeline')} className="bg-brand-primary/10 text-brand-primary text-xs font-bold px-3 py-1.5 rounded-full hover:bg-brand-primary/20 transition-colors">
                                     {deal.title}
                                 </button>
                             ))}
                             {(!deals || deals.length === 0) && (
                                <button onClick={() => setViewMode('timeline')} className="bg-brand-primary/10 text-brand-primary text-xs font-bold px-3 py-1.5 rounded-full hover:bg-brand-primary/20 transition-colors">
                                    deal
                                </button>
                             )}
                         </div>
                     </div>
                     <div className="flex items-center gap-3">
                         <span className="text-sm font-bold text-text-secondary w-20">Task by</span>
                         <div className="flex flex-wrap gap-2">
                             {products?.slice(0, 5).map((prod, i) => (
                                 <button key={i} onClick={() => setViewMode('timeline')} className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-orange-200 transition-colors">
                                     {prod.name}
                                 </button>
                             ))}
                             {(!products || products.length === 0) && (
                                 <button onClick={() => setViewMode('timeline')} className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-orange-200 transition-colors">
                                     Product
                                 </button>
                             )}
                         </div>
                     </div>
                 </div>
             </div>
             
             {/* Hint to user */}
             <div className="mt-8 text-text-tertiary text-xs flex items-center gap-2">
                 <ArrowRight size={14} />
                 <span>Select a category to view the timeline</span>
             </div>
         </div>
     ) : (
        <>
            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-border-main animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-text-tertiary text-xs font-bold uppercase tracking-wider mr-2">
                    <Filter size={14} />
                    <span>Filter by:</span>
                </div>
                
                <select disabled className="bg-bg-surface border border-border-main text-text-secondary text-xs rounded-md px-3 py-1.5 focus:border-brand-primary focus:outline-none opacity-60">
                    <option>All Assignees</option>
                </select>

                <select 
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="bg-bg-surface border border-border-main text-text-secondary text-xs rounded-md px-3 py-1.5 focus:border-brand-primary focus:outline-none cursor-pointer hover:border-brand-primary/50"
                >
                    <option value="All">All Priorities</option>
                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>

                <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-bg-surface border border-border-main text-text-secondary text-xs rounded-md px-3 py-1.5 focus:border-brand-primary focus:outline-none cursor-pointer hover:border-brand-primary/50"
                >
                    <option value="All">All Statuses</option>
                    {TASK_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                
                <button 
                    onClick={() => setViewMode('landing')}
                    className="ml-auto text-xs font-bold text-brand-primary hover:underline"
                >
                    Back to Categories
                </button>
            </div>

            {/* Calendar Strip */}
            <div className="flex justify-between items-center bg-bg-surface border border-border-main rounded-xl p-2 shadow-sm mb-2 overflow-x-auto animate-in fade-in slide-in-from-top-3">
                {getWeekDays().map((date, i) => {
                    const active = isToday(date);
                    return (
                        <div key={i} className={`flex flex-col items-center justify-center min-w-[3.5rem] py-2 rounded-lg cursor-pointer transition-colors ${active ? 'bg-brand-primary text-white shadow-md' : 'hover:bg-bg-muted text-text-secondary'}`}>
                            <span className={`text-[10px] uppercase font-bold ${active ? 'text-white/80' : 'text-text-tertiary'}`}>{new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date)}</span>
                            <span className={`text-sm font-bold ${active ? 'text-white' : 'text-text-primary'}`}>{date.getDate()}</span>
                        </div>
                    )
                })}
            </div>

            {/* Task Groups */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4">
                {isLoading && <LoadingSpinner message="Loading timeline..." />}
                
                {!isLoading && filteredTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 opacity-60">
                        <CheckSquare size={40} className="text-text-tertiary mb-2" />
                        <p className="text-sm text-text-secondary">No tasks found</p>
                    </div>
                )}

                {groupedTasks.overdue.length > 0 && (
                    <div className="space-y-2">
                        <h2 className="text-xs font-bold text-danger uppercase tracking-wider flex items-center gap-2 mb-3">
                            <AlertCircle size={14} />
                            Overdue
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {groupedTasks.overdue.map(renderTaskCard)}
                        </div>
                    </div>
                )}

                {groupedTasks.today.length > 0 && (
                    <div className="space-y-2">
                        <h2 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-3">
                            Today
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {groupedTasks.today.map(renderTaskCard)}
                        </div>
                    </div>
                )}

                {groupedTasks.tomorrow.length > 0 && (
                    <div className="space-y-2">
                        <h2 className="text-sm font-bold text-text-secondary flex items-center gap-2 mb-3">
                            Tomorrow
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {groupedTasks.tomorrow.map(renderTaskCard)}
                        </div>
                    </div>
                )}

                {groupedTasks.thisWeek.length > 0 && (
                    <div className="space-y-2">
                        <h2 className="text-sm font-bold text-text-secondary flex items-center gap-2 mb-3">
                            This Week
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {groupedTasks.thisWeek.map(renderTaskCard)}
                        </div>
                    </div>
                )}

                {groupedTasks.later.length > 0 && (
                    <div className="space-y-2">
                        <h2 className="text-sm font-bold text-text-tertiary flex items-center gap-2 mb-3">
                            Later
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {groupedTasks.later.map(renderTaskCard)}
                        </div>
                    </div>
                )}
                
                {groupedTasks.noDate.length > 0 && (
                    <div className="space-y-2">
                        <h2 className="text-sm font-bold text-text-tertiary flex items-center gap-2 mb-3">
                            No Date
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {groupedTasks.noDate.map(renderTaskCard)}
                        </div>
                    </div>
                )}
            </div>
      </>
     )}

      {/* FAB - Only show in Timeline */}
      {viewMode === 'timeline' && (
          <button 
            onClick={() => openDrawer()}
            className="fixed bottom-8 right-8 w-14 h-14 bg-brand-primary text-white rounded-full shadow-xl flex items-center justify-center hover:bg-brand-accent transition-transform hover:scale-105 active:scale-95 z-50"
          >
              <Plus size={28} />
          </button>
      )}

      {/* SlideOver Drawer */}
      <SlideOver 
        isOpen={isDrawerOpen} 
        onClose={closeDrawer}
        title={selectedTask ? "Edit Task" : "New Task"}
        description={selectedTask ? "Update task details" : "Create a new task"}
        width="520px"
      >
        <form onSubmit={handleSubmit} id="task-form" className="space-y-6">
          {formError && (
             <div className="p-3 bg-danger/10 border border-danger text-danger text-xs rounded">
               {formError}
             </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Title <span className="text-danger">*</span></label>
              <input 
                required
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Task title" 
                className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Project / Company</label>
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
                    placeholder="Select project..."
                 />
               </div>
               <div className="space-y-1">
                  <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Related Contact</label>
                   <select className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm opacity-60 cursor-not-allowed">
                       <option>Select Contact (Coming Soon)</option>
                   </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                  <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Due Date</label>
                  <input 
                    type="date" 
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
                  />
               </div>
               <div className="space-y-1">
                   <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Priority</label>
                   <select 
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
                   >
                      {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                   </select>
               </div>
            </div>

            <div className="space-y-1">
               <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Status</label>
               <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
               >
                  {TASK_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
            </div>

             <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Description</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Add task details..."
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
              {taskMutation.isPending ? "Saving..." : (selectedTask ? "Update Task" : "Create Task")}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}

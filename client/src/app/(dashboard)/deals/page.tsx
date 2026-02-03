"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Filter, MoreVertical, Briefcase, Loader2, IndianRupee, TrendingUp, Calendar } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import SlideOver from "@/components/SlideOver";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  company_id?: string;
  contact_id?: string;
  expected_close_date?: string;
  description?: string;
}

export default function DealsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    value: 0,
    stage: "Qualification",
    probability: 20,
    company_id: "",
    expected_close_date: "",
    description: ""
  });
  const [formError, setFormError] = useState("");
  
  const queryClient = useQueryClient();

  // 1. Fetch Deals
  const { data: deals, isLoading } = useQuery<Deal[]>({
    queryKey: ["deals"],
    queryFn: async () => {
      const response = await api.get("/deals/");
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

  // 3. Create/Update Deal Mutation
  const dealMutation = useMutation({
    mutationFn: (data: any) => {
      if (selectedDeal) {
        return api.put(`/deals/${selectedDeal.id}`, data);
      }
      return api.post("/deals/", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      closeDrawer();
    },
    onError: (err: any) => {
      setFormError(getErrorMessage(err));
    }
  });

  // 4. Delete Deal Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/deals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    }
  });

  const openDrawer = (deal?: Deal) => {
    if (deal) {
      setSelectedDeal(deal);
      setFormData({
        title: deal.title,
        value: deal.value,
        stage: deal.stage,
        probability: deal.probability,
        company_id: deal.company_id || "",
        expected_close_date: deal.expected_close_date || "",
        description: deal.description || ""
      });
    } else {
      setSelectedDeal(null);
      setFormData({ title: "", value: 0, stage: "Qualification", probability: 20, company_id: "", expected_close_date: "", description: "" });
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedDeal(null);
    setFormError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    dealMutation.mutate(formData);
  };

  const getStageColor = (stage: string) => {
    switch(stage) {
      case 'Closed Won': return 'bg-success/10 text-success border-success/20';
      case 'Closed Lost': return 'bg-danger/10 text-danger border-danger/20';
      case 'Negotiation': return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
      default: return 'bg-white/5 text-text-secondary border-white/10';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Deals</h1>
          <p className="text-text-secondary text-sm">Track your sales pipeline and opportunities</p>
        </div>
        <button 
          onClick={() => openDrawer()}
          className="bg-brand-primary hover:bg-brand-accent text-white px-4 py-2 rounded-md font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-primary/20 transform active:scale-[0.98]"
        >
          <Plus size={18} />
          New Deal
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-bg-surface border border-border-main p-4 rounded-card flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
          <input 
            type="text" 
            placeholder="Search deals by title or company..." 
            className="w-full bg-bg-page border border-border-input text-white pl-10 pr-4 py-2 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
          />
        </div>
        <button className="px-4 py-2 bg-white/5 border border-border-main text-text-secondary hover:text-white rounded-md flex items-center gap-2 transition-colors text-sm">
          <Filter size={16} />
          Pipeline Stage
        </button>
      </div>

      {/* Loading & Empty States */}
      {isLoading ? (
        <LoadingSpinner message="Loading deals..." />
      ) : (!deals || deals.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border-main rounded-card">
          <div className="p-4 bg-white/5 rounded-full text-text-tertiary mb-4">
            <Briefcase size={32} />
          </div>
          <h3 className="text-white font-bold">No deals tracked yet</h3>
          <p className="text-text-secondary text-sm mt-1">Create your first deal to start tracking revenue.</p>
          <button 
            onClick={() => openDrawer()}
            className="mt-6 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white px-4 py-2 rounded-md font-bold transition-all"
          >
            Create Deal
          </button>
        </div>
      ) : (
        /* Deals Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {deals?.map((deal) => (
            <div key={deal.id} className="bg-bg-surface border border-border-main rounded-card p-6 hover:border-brand-primary/40 transition-all group relative">
              <div className="flex justify-between items-start mb-6">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border ${getStageColor(deal.stage)}`}>
                  {deal.stage}
                </span>
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openDrawer(deal)}
                    className="p-1 hover:text-brand-primary text-text-tertiary transition-colors"
                  >
                    <Filter size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm(`Delete ${deal.title}?`)) deleteMutation.mutate(deal.id);
                    }}
                    className="p-1 hover:text-danger text-text-tertiary transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-brand-primary transition-colors line-clamp-1 mb-2">
                {deal.title}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <IndianRupee size={16} className="text-success" />
                    <span className="text-xl font-bold text-white">
                      {new Intl.NumberFormat('en-IN').format(deal.value)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-tertiary text-sm">
                    <TrendingUp size={14} />
                    <span>{deal.probability}%</span>
                  </div>
                </div>

                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-primary rounded-full" 
                    style={{ width: `${deal.probability}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border-main">
                  <div className="flex items-center gap-2 text-text-tertiary">
                    <Briefcase size={14} />
                    <span className="text-xs truncate max-w-[120px]">
                      {companies?.find(c => c.id === deal.company_id)?.name || "Individual"}
                    </span>
                  </div>
                  {deal.expected_close_date && (
                    <div className="flex items-center gap-2 text-text-tertiary">
                      <Calendar size={14} />
                      <span className="text-xs">
                        {new Date(deal.expected_close_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SlideOver Form */}
      <SlideOver 
        isOpen={isDrawerOpen} 
        onClose={closeDrawer}
        title={selectedDeal ? "Edit Deal" : "Add New Deal"}
        description={selectedDeal ? "Update deal progress" : "Capture a new business opportunity"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="p-3 bg-danger/10 border border-danger text-danger text-xs rounded">
              {formError}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Deal Title</label>
              <input 
                required
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enterprise Software License" 
                className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Deal Value (INR)</label>
                <input 
                  required
                  type="number" 
                  value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})}
                  placeholder="50000" 
                  className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm text-success font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Close Date</label>
                <input 
                  type="date" 
                  value={formData.expected_close_date}
                  onChange={(e) => setFormData({...formData, expected_close_date: e.target.value})}
                  className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Pipeline Stage</label>
                <select 
                  value={formData.stage}
                  onChange={(e) => setFormData({...formData, stage: e.target.value})}
                  className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
                >
                  <option value="Qualification">Qualification</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Closed Won">Closed Won</option>
                  <option value="Closed Lost">Closed Lost</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Probability (%)</label>
                <input 
                  type="number" 
                  value={formData.probability} onChange={e => setFormData({...formData, probability: Number(e.target.value)})}
                  placeholder="20" 
                  className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Associated Company</label>
              <select 
                value={formData.company_id}
                onChange={(e) => setFormData({...formData, company_id: e.target.value})}
                className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
              >
                <option value="">None / Individual</option>
                {companies?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
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
              disabled={dealMutation.isPending}
              className="flex-1 bg-brand-primary hover:bg-brand-accent text-white font-bold py-3 rounded-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {dealMutation.isPending && <Loader2 className="animate-spin" size={18} />}
              {dealMutation.isPending ? "Saving..." : (selectedDeal ? "Update Deal" : "Save Deal")}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}

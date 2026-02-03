"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Filter, Briefcase, Loader2, IndianRupee, TrendingUp, Calendar, Pencil, Trash2, UserCircle } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import SlideOver from "@/components/SlideOver";
import LoadingSpinner from "@/components/LoadingSpinner";
import NotesSection from "@/components/NotesSection";
import Combobox from "@/components/Combobox";

interface Deal {
  id?: string;
  _id?: string;
  title: string;
  value: string | number;
  stage: string;
  probability: string | number;
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
    value: "" as string | number,
    stage: "Qualification",
    probability: "" as string | number,
    company_id: "",
    contact_id: "",
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
  const { data: companies } = useQuery<Array<{id: string, _id?: string, name: string}>>({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await api.get("/companies/");
      return response.data;
    }
  });

  // 3. Fetch People
  const { data: people } = useQuery<Array<{id: string, _id?: string, first_name: string, last_name: string, company_id?: string}>>({
    queryKey: ["people"],
    queryFn: async () => {
      const response = await api.get("/people/");
      return response.data;
    }
  });

  // 3. Create/Update Deal Mutation
  const dealMutation = useMutation({
    mutationFn: (data: unknown) => {
      if (selectedDeal) {
        return api.put(`/deals/${selectedDeal.id}`, data);
      }
      return api.post("/deals/", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      closeDrawer();
    },
    onError: (err: unknown) => {
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
        contact_id: deal.contact_id || "",
        expected_close_date: deal.expected_close_date || "",
        description: deal.description || ""
      });
    } else {
      setSelectedDeal(null);
      setFormData({ title: "", value: "", stage: "Qualification", probability: "", company_id: "", contact_id: "", expected_close_date: "", description: "" });
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
    const submissionData = {
      ...formData,
      value: Number(formData.value) || 0,
      probability: Number(formData.probability) || 0
    };
    dealMutation.mutate(submissionData);
  };

  const getStageColor = (stage: string) => {
    switch(stage) {
      case 'Closed Won': return 'bg-success/10 text-success border-success/20';
      case 'Closed Lost': return 'bg-danger/10 text-danger border-danger/20';
      case 'Negotiation': return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
      default: return 'bg-bg-muted text-text-secondary border-border-main';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Deals</h1>
          <p className="text-text-secondary text-sm">Track your sales pipeline and opportunities</p>
        </div>
        <button 
          onClick={() => openDrawer()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">New Deal</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-bg-surface border border-border-main p-4 rounded-card flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
          <input 
            type="text" 
            placeholder="Search deals by title or company..." 
            className="w-full bg-bg-page border border-border-input text-text-primary pl-10 pr-4 py-2 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm shadow-sm"
          />
        </div>
        <button className="w-full sm:w-auto btn-ghost border border-border-main flex items-center justify-center gap-2 shadow-sm">
          <Filter size={16} />
          Pipeline Stage
        </button>
      </div>

      {/* Loading & Empty States */}
      {isLoading ? (
        <LoadingSpinner message="Loading deals..." />
      ) : (!deals || deals.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border-main rounded-card">
          <div className="p-4 bg-brand-primary/10 rounded-full text-brand-primary mb-4">
            <Briefcase size={32} />
          </div>
          <h3 className="text-text-primary font-bold">No deals tracked yet</h3>
          <p className="text-text-secondary text-sm mt-1">Create your first deal to start tracking revenue.</p>
          <button 
            onClick={() => openDrawer()}
            className="mt-6 btn-primary"
          >
            Create Deal
          </button>
        </div>
      ) : (
        /* Deals Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {deals?.map((deal, index) => (
            <div key={deal.id || deal._id || index} className="bg-bg-surface border border-border-main rounded-card p-6 hover:border-brand-primary/40 transition-all group relative">
              <div className="flex justify-between items-start mb-6">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border ${getStageColor(deal.stage)}`}>
                  {deal.stage}
                </span>
                <div className="absolute top-4 right-4 flex gap-1 transition-opacity">
                  <button 
                    onClick={() => openDrawer(deal)}
                    className="p-1 hover:text-brand-primary text-text-tertiary transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      const dealId = deal.id || deal._id;
                      if (dealId && confirm(`Delete ${deal.title}?`)) deleteMutation.mutate(dealId);
                    }}
                    className="p-1 hover:text-danger text-text-tertiary transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-text-primary group-hover:text-brand-primary transition-colors line-clamp-1 mb-2">
                {deal.title}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <IndianRupee size={16} className="text-success" />
                    <span className="text-xl font-bold text-text-primary">
                      {new Intl.NumberFormat('en-IN').format(Number(deal.value))}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-tertiary text-sm">
                    <TrendingUp size={14} />
                    <span>{deal.probability}%</span>
                  </div>
                </div>

                <div className="w-full bg-bg-muted h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-primary rounded-full" 
                    style={{ width: `${deal.probability}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border-main">
                  <div className="flex items-center gap-2 text-text-tertiary">
                    <Briefcase size={14} />
                    <span className="text-xs truncate max-w-[120px]">
                      {companies?.find(c => (c.id || c._id) === deal.company_id)?.name || "Individual"}
                    </span>
                  </div>
                  {deal.contact_id && (
                     <div className="flex items-center gap-2 text-text-tertiary">
                        <UserCircle size={14} />
                        <span className="text-xs truncate max-w-[120px]">
                           {people?.find(p => (p.id || p._id) === deal.contact_id)?.first_name}
                        </span>
                     </div>
                  )}
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
        <form onSubmit={handleSubmit} id="deal-form" className="space-y-6">
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
                className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Deal Value (INR)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-success">
                    <IndianRupee size={16} />
                  </div>
                  <input 
                    required
                    type="number" 
                    value={formData.value} 
                    onChange={e => setFormData({...formData, value: e.target.value})}
                    placeholder="50000" 
                    className="w-full bg-bg-muted border border-border-input text-text-primary pl-10 pr-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm text-success font-bold no-spinners"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Close Date</label>
                <input 
                  type="date" 
                  value={formData.expected_close_date}
                  onChange={(e) => setFormData({...formData, expected_close_date: e.target.value})}
                  className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Pipeline Stage</label>
                <select 
                  value={formData.stage}
                  onChange={(e) => setFormData({...formData, stage: e.target.value})}
                  className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
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
                  value={formData.probability} 
                  onChange={e => setFormData({...formData, probability: e.target.value})}
                  placeholder="20" 
                  className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Associated Company</label>
              <Combobox 
                options={companies ? companies.filter(c => c && (c.id || c._id)).map(c => ({ id: c.id || c._id || "", label: c.name })) : []}
                value={formData.company_id}
                onChange={(val) => setFormData({...formData, company_id: val, contact_id: ""})}
                placeholder="Search for a company..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Associated Contact</label>
              <Combobox 
                options={people ? people.filter(p => !formData.company_id || (p.company_id === formData.company_id)).map(p => ({ 
                  id: p.id || p._id || "", 
                  label: `${p.first_name} ${p.last_name}` 
                })) : []}
                value={formData.contact_id}
                onChange={(val) => setFormData({...formData, contact_id: val})}
                placeholder={formData.company_id ? "Search for a contact..." : "Select a company first"}
                disabled={!formData.company_id}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Description</label>
              <textarea 
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Add details about this deal..."
                className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm resize-none"
              />
            </div>
          </div>
        </form>

        {selectedDeal && (selectedDeal.id || selectedDeal._id) && (
          <NotesSection 
            relatedToType="deal" 
            relatedToId={selectedDeal.id || selectedDeal._id || ""} 
          />
        )}

        <div className="pt-8 border-t border-border-main flex gap-3 mt-4">
          <button 
            type="button"
            onClick={closeDrawer}
            className="flex-1 btn-ghost border border-border-main font-bold"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="deal-form"
            disabled={dealMutation.isPending}
            className="flex-1 btn-primary font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {dealMutation.isPending && <Loader2 className="animate-spin" size={18} />}
            {dealMutation.isPending ? "Saving..." : (selectedDeal ? "Update Deal" : "Save Deal")}
          </button>
        </div>
      </SlideOver>
    </div>
  );
}

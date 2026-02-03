"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Filter, Loader2, FileText } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import SlideOver from "@/components/SlideOver";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Lead {
  id?: string;
  _id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  source?: string;
  status: string;
  notes?: string;
}

export default function LeadsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    source: "Website",
    status: "New",
    notes: ""
  });
  const [formError, setFormError] = useState("");
  
  const queryClient = useQueryClient();

  // 1. Fetch Leads
  const { data: leads, isLoading, isError, error } = useQuery<Lead[]>({
    queryKey: ["leads"],
    queryFn: async () => {
      const response = await api.get("/leads/");
      return response.data;
    }
  });

  // 2. Create/Update Mutation
  const leadMutation = useMutation({
    mutationFn: (data: Partial<Lead>) => {
      if (selectedLead) {
        const leadId = selectedLead.id || selectedLead._id;
        return api.put(`/leads/${leadId}`, data);
      }
      return api.post("/leads/", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      closeDrawer();
    },
    onError: (err: unknown) => {
      setFormError(getErrorMessage(err));
    }
  });

  // 3. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/leads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    }
  });

  // 4. Sync Mail Mutation
  const syncMailMutation = useMutation({
    mutationFn: (id: string) => api.post(`/leads/${id}/sync-mail`),
    onSuccess: (response: { data: { message: string } }) => {
      alert(response.data.message);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (err: unknown) => {
      alert(getErrorMessage(err));
    }
  });

  const openDrawer = (lead?: Lead) => {
    if (lead) {
      setSelectedLead(lead);
      setFormData({
        first_name: lead.first_name,
        last_name: lead.last_name,
        email: lead.email,
        phone: lead.phone || "",
        company: lead.company || "",
        source: lead.source || "Website",
        status: lead.status || "New",
        notes: lead.notes || ""
      });
    } else {
      setSelectedLead(null);
      setFormData({ 
        first_name: "", last_name: "", email: "", phone: "", 
        company: "", source: "Website", status: "New", notes: "" 
      });
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedLead(null);
    setFormError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    leadMutation.mutate(formData);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Leads</h1>
          <p className="text-text-secondary text-sm">Track and manage potential customers</p>
        </div>
        <button 
          onClick={() => openDrawer()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add Lead
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-bg-surface border border-border-main p-4 rounded-card flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
          <input 
            type="text" 
            placeholder="Search leads..." 
            className="w-full bg-bg-page border border-border-input text-text-primary pl-10 pr-4 py-2 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm shadow-sm"
          />
        </div>
        <button className="w-full sm:w-auto btn-ghost border border-border-main flex items-center justify-center gap-2 shadow-sm">
          <Filter size={16} />
          Filters
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading leads..." />
      ) : isError ? (
        <div className="p-8 bg-danger/10 border border-danger/20 rounded-card text-center">
          <p className="text-danger font-bold">Failed to load leads</p>
          <p className="text-text-secondary text-sm mt-1">{getErrorMessage(error)}</p>
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ["leads"] })}
            className="mt-4 text-brand-primary hover:underline text-sm font-bold"
          >
            Try again
          </button>
        </div>
      ) : (!leads || leads.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border-main rounded-card">
          <div className="p-4 bg-brand-primary/10 rounded-full text-brand-primary mb-4">
            <FileText size={32} />
          </div>
          <h3 className="text-text-primary font-bold">No leads found</h3>
          <p className="text-text-secondary text-sm mt-1">Capture your first lead to start your sales process.</p>
          <button 
            onClick={() => openDrawer()}
            className="mt-6 btn-primary"
          >
            Create Lead
          </button>
        </div>
      ) : (
        <div className="bg-bg-surface border border-border-main rounded-card overflow-hidden flex flex-col">
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-220px)]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-20 shadow-sm">
                <tr className="border-b border-border-main bg-bg-muted">
                <th className="px-6 py-3 font-medium text-text-primary text-sm">Lead Name</th>
                <th className="px-6 py-3 font-medium text-text-primary text-sm">Status</th>
                <th className="px-6 py-3 font-medium text-text-primary text-sm">Company</th>
                <th className="px-6 py-3 font-medium text-text-primary text-sm">Source</th>
                <th className="px-6 py-3 font-medium text-text-primary text-sm">Email</th>
                <th className="px-6 py-3 font-medium text-text-primary text-sm text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main">
              {leads?.filter(l => l && (l.id || l._id)).map((lead) => (
                <tr key={lead.id || lead._id} className="bg-bg-surface hover:bg-bg-muted border-b border-border-main transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-text-primary">
                    {lead.first_name} {lead.last_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      lead.status === 'New' ? 'bg-blue-500/10 text-blue-500' :
                      lead.status === 'Contacted' ? 'bg-yellow-500/10 text-yellow-500' :
                      lead.status === 'Qualified' ? 'bg-green-500/10 text-green-500' :
                      'bg-white/5 text-text-tertiary'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{lead.company || "N/A"}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{lead.source}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{lead.email}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3 transition-opacity">
                      <button 
                        onClick={() => syncMailMutation.mutate(lead.id || lead._id || "")}
                        disabled={syncMailMutation.isPending}
                        className="font-medium text-brand-primary hover:underline text-sm"
                      >
                        Sync
                      </button>
                      <button 
                        onClick={() => openDrawer(lead)} 
                        className="font-medium text-brand-primary hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          const leadId = lead.id || lead._id;
                          if (leadId && confirm("Delete this lead?")) deleteMutation.mutate(leadId);
                        }}
                        className="font-medium text-danger hover:underline text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      )}

      <SlideOver 
        isOpen={isDrawerOpen} 
        onClose={closeDrawer}
        title={selectedLead ? "Edit Lead" : "Add New Lead"}
        description="Track a potential customer relationship"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && <div className="p-3 bg-danger/10 border border-danger text-danger text-xs rounded">{formError}</div>}
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input 
                required placeholder="First Name" className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
                value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})}
              />
              <input 
                required placeholder="Last Name" className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
                value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})}
              />
            </div>
            <input 
              required type="email" placeholder="Email Address" className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <input 
              placeholder="Company" className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
              value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <select 
                className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm" value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Lost">Lost</option>
              </select>
              <select 
                className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm" value={formData.source} 
                onChange={e => setFormData({...formData, source: e.target.value})}
              >
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <textarea 
              placeholder="Notes" className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm h-32 resize-none"
              value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="pt-6 border-t border-border-main flex gap-3">
            <button type="button" onClick={closeDrawer} className="flex-1 btn-ghost border border-border-main font-bold">Cancel</button>
            <button 
              type="submit" disabled={leadMutation.isPending}
              className="flex-1 btn-primary font-bold flex items-center justify-center gap-2"
            >
              {leadMutation.isPending && <Loader2 className="animate-spin" size={18} />}
              {leadMutation.isPending ? "Saving..." : "Save Lead"}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}

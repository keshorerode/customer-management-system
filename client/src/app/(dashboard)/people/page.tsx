"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Filter, MoreVertical, Mail, Phone, Building2, UserCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import SlideOver from "@/components/SlideOver";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  job_title?: string;
  company_id?: string;
  company_name?: string; // We'll handle this in the UI or fetch linked data
}

export default function PeoplePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    job_title: "",
    phone: "",
    company_id: ""
  });
  const [formError, setFormError] = useState("");
  
  const queryClient = useQueryClient();

  // 1. Fetch People
  const { data: people, isLoading } = useQuery<Person[]>({
    queryKey: ["people"],
    queryFn: async () => {
      const response = await api.get("/people/");
      return response.data;
    }
  });

  // 2. Fetch Companies for the dropdown
  const { data: companies } = useQuery<any[]>({
    queryKey: ["companies-list"],
    queryFn: async () => {
      const response = await api.get("/companies/");
      return response.data;
    }
  });

  // 3. Create Person Mutation
  const createPerson = useMutation({
    mutationFn: (newPerson: any) => api.post("/people/", newPerson),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      setIsDrawerOpen(false);
      setFormData({ first_name: "", last_name: "", email: "", job_title: "", phone: "", company_id: "" });
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.detail || "Failed to create contact");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    createPerson.mutate(formData);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">People</h1>
          <p className="text-text-secondary text-sm">Manage your contacts and their relationships</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="bg-brand-primary hover:bg-brand-accent text-white px-4 py-2 rounded-md font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-primary/20 transform active:scale-[0.98]"
        >
          <Plus size={18} />
          Add Person
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-bg-surface border border-border-main p-4 rounded-card flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
          <input 
            type="text" 
            placeholder="Search contacts by name, email, or company..." 
            className="w-full bg-bg-page border border-border-input text-white pl-10 pr-4 py-2 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
          />
        </div>
        <button className="px-4 py-2 bg-white/5 border border-border-main text-text-secondary hover:text-white rounded-md flex items-center gap-2 transition-colors text-sm">
          <Filter size={16} />
          Filters
        </button>
      </div>

      {/* Loading & Empty States */}
      {isLoading ? (
        <LoadingSpinner message="Loading contacts..." />
      ) : (!people || people.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border-main rounded-card">
          <div className="p-4 bg-white/5 rounded-full text-text-tertiary mb-4">
            <UserCircle size={32} />
          </div>
          <h3 className="text-white font-bold">No contacts found</h3>
          <p className="text-text-secondary text-sm mt-1">Add your first contact to start building relationships.</p>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="mt-6 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white px-4 py-2 rounded-md font-bold transition-all"
          >
            Create Contact
          </button>
        </div>
      ) : (
        /* People Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {people?.filter(p => p && p.id).map((person) => (
            <div key={person.id} className="bg-bg-surface border border-border-main rounded-card p-6 hover:border-brand-primary/40 transition-all group relative">
              <button className="absolute top-4 right-4 text-text-tertiary hover:text-white transition-colors">
                <MoreVertical size={18} />
              </button>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4 border border-brand-primary/20 text-xl font-bold">
                  {person.first_name[0]}{person.last_name[0]}
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-brand-primary transition-colors truncate w-full">
                  {person.first_name} {person.last_name}
                </h3>
                <p className="text-xs text-brand-primary font-medium mt-1 truncate w-full">{person.job_title || "Contact"}</p>
                
                <div className="mt-4 flex items-center gap-1.5 text-text-secondary">
                  <Building2 size={14} />
                  <span className="text-xs truncate max-w-[120px]">
                    {companies?.find(c => c.id === person.company_id)?.name || "Individual"}
                  </span>
                </div>

                <div className="mt-6 w-full space-y-3 pt-6 border-t border-border-main text-left">
                  <div className="flex items-center gap-3 text-text-tertiary hover:text-white transition-colors cursor-pointer group/item overflow-hidden">
                    <Mail size={14} className="flex-shrink-0" />
                    <span className="text-xs truncate">{person.email}</span>
                  </div>
                  {person.phone && (
                    <div className="flex items-center gap-3 text-text-tertiary hover:text-white transition-colors cursor-pointer overflow-hidden">
                      <Phone size={14} className="flex-shrink-0" />
                      <span className="text-xs truncate">{person.phone}</span>
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
        onClose={() => setIsDrawerOpen(false)}
        title="Add New Person"
        description="Create a new contact profile"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="p-3 bg-danger/10 border border-danger text-danger text-xs rounded">
              {formError}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">First Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  placeholder="Jane" 
                  className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Last Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  placeholder="Doe" 
                  className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Email Address</label>
              <input 
                required
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="jane.doe@company.com" 
                className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Job Title</label>
              <input 
                type="text" 
                value={formData.job_title}
                onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                placeholder="Marketing Manager" 
                className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
              />
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

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Phone Number</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+91 98765 43210" 
                className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
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
              disabled={createPerson.isPending}
              className="flex-1 bg-brand-primary hover:bg-brand-accent text-white font-bold py-3 rounded-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {createPerson.isPending && <Loader2 className="animate-spin" size={18} />}
              {createPerson.isPending ? "Creating..." : "Save Contact"}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Filter, Mail, Phone, Building2, UserCircle, Loader2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import SlideOver from "@/components/SlideOver";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Person {
  id?: string;
  _id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  job_title?: string;
  company_id?: string;
}

export default function PeoplePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
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
  const { data: people, isLoading, isError, error } = useQuery<Person[]>({
    queryKey: ["people"],
    queryFn: async () => {
      const response = await api.get("/people/");
      return response.data;
    }
  });

  // 2. Fetch Companies for the dropdown
  const { data: companies } = useQuery<Array<{id: string, _id?: string, name: string}>>({
    queryKey: ["companies-list"],
    queryFn: async () => {
      const response = await api.get("/companies/");
      return response.data;
    }
  });

  // 3. Create/Update Person Mutation
  const personMutation = useMutation({
    mutationFn: (data: Partial<Person>) => {
      if (selectedPerson) {
        const personId = selectedPerson.id || selectedPerson._id;
        return api.put(`/people/${personId}`, data);
      }
      return api.post("/people/", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      closeDrawer();
    },
    onError: (err: unknown) => {
      setFormError(getErrorMessage(err));
    }
  });

  // 4. Delete Person Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/people/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
    }
  });

  const openDrawer = (person?: Person) => {
    if (person) {
      setSelectedPerson(person);
      setFormData({
        first_name: person.first_name,
        last_name: person.last_name,
        email: person.email,
        job_title: person.job_title || "",
        phone: person.phone || "",
        company_id: person.company_id || ""
      });
    } else {
      setSelectedPerson(null);
      setFormData({ first_name: "", last_name: "", email: "", job_title: "", phone: "", company_id: "" });
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedPerson(null);
    setFormError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    personMutation.mutate(formData);
  };

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner message="Loading contacts..." />;

    if (isError) return (
      <div className="p-8 bg-danger/10 border border-danger/20 rounded-card text-center">
        <p className="text-danger font-bold">Failed to load contacts</p>
        <p className="text-text-secondary text-sm mt-1">{getErrorMessage(error)}</p>
        <button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ["people"] })}
          className="mt-4 text-brand-primary hover:underline text-sm font-bold"
        >
          Try again
        </button>
      </div>
    );

    if (!people || people.length === 0) return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border-main rounded-card">
        <div className="p-4 bg-white/5 rounded-full text-text-tertiary mb-4">
          <UserCircle size={32} />
        </div>
        <h3 className="text-white font-bold">No contacts found</h3>
        <p className="text-text-secondary text-sm mt-1">Add your first contact to start building relationships.</p>
        <button 
          onClick={() => openDrawer()}
          className="mt-6 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white px-4 py-2 rounded-md font-bold transition-all"
        >
          Create Contact
        </button>
      </div>
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {people?.filter(p => p && (p.id || p._id)).map((person) => {
          const personId = person.id || person._id;
          if (!personId) return null;
          return (
            <div key={personId} className="bg-bg-surface border border-border-main rounded-card p-6 hover:border-brand-primary/40 transition-all group relative">
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openDrawer(person)}
                  title="Edit contact"
                  className="p-1 hover:text-brand-primary text-text-tertiary transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button 
                  onClick={() => {
                    const personId = person.id || person._id;
                    if (personId && confirm(`Delete ${person.first_name}?`)) deleteMutation.mutate(personId);
                  }}
                  title="Delete contact"
                  className="p-1 hover:text-danger text-text-tertiary transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
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
                    {companies?.find(c => (c.id || c._id) === person.company_id)?.name || "Individual"}
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
          );
        })}
      </div>
    );
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
          onClick={() => openDrawer()}
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

      {/* Main Content */}
      {renderContent()}

      {/* SlideOver Form */}
      <SlideOver 
        isOpen={isDrawerOpen} 
        onClose={closeDrawer}
        title={selectedPerson ? "Edit Person" : "Add New Person"}
        description={selectedPerson ? "Update contact profile" : "Create a new contact profile"}
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
                {companies?.filter(c => c && (c.id || c._id)).map(c => (
                  <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
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
              onClick={closeDrawer}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-md transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={personMutation.isPending}
              className="flex-1 bg-brand-primary hover:bg-brand-accent text-white font-bold py-3 rounded-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {personMutation.isPending && <Loader2 className="animate-spin" size={18} />}
              {personMutation.isPending ? "Saving..." : (selectedPerson ? "Update Contact" : "Save Contact")}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}

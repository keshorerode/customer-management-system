"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Filter, Building2, Globe, ExternalLink, Loader2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import SlideOver from "@/components/SlideOver";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Company {
  id?: string;
  _id?: string;
  name: string;
  domain?: string;
  industry?: string;
  company_size?: string;
  website: string;
  email: string;
}

export default function CompaniesPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    industry: "Technology",
    company_size: "11-50",
    website: "",
    email: ""
  });
  const [formError, setFormError] = useState("");
  
  const queryClient = useQueryClient();

  // 1. Fetch Companies
  const { data: companies, isLoading, isError, error } = useQuery<Company[]>({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await api.get("/companies/");
      return response.data;
    }
  });

  // 2. Create/Update Company Mutation
  const companyMutation = useMutation({
    mutationFn: (data: Partial<Company>) => {
      if (selectedCompany) {
        return api.put(`/companies/${selectedCompany.id}`, data);
      }
      return api.post("/companies/", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      closeDrawer();
    },
    onError: (err: unknown) => {
      setFormError(getErrorMessage(err));
    }
  });

  // 3. Delete Company Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/companies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    }
  });

  const openDrawer = (company?: Company) => {
    if (company) {
      setSelectedCompany(company);
      setFormData({
        name: company.name,
        domain: company.domain || "",
        industry: company.industry || "Technology",
        company_size: company.company_size || "11-50",
        website: company.website || "",
        email: company.email || ""
      });
    } else {
      setSelectedCompany(null);
      setFormData({ name: "", domain: "", industry: "Technology", company_size: "11-50", website: "", email: "" });
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedCompany(null);
    setFormData({ name: "", domain: "", industry: "Technology", company_size: "11-50", website: "", email: "" });
    setFormError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    companyMutation.mutate(formData);
  };

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner message="Loading companies..." />;
    
    if (isError) return (
      <div className="p-8 bg-danger/10 border border-danger/20 rounded-card text-center">
        <p className="text-danger font-bold">Failed to load companies</p>
        <p className="text-text-secondary text-sm mt-1">{getErrorMessage(error)}</p>
        <button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ["companies"] })}
          className="mt-4 text-brand-primary hover:underline text-sm font-bold"
        >
          Try again
        </button>
      </div>
    );

    if (!companies || companies.length === 0) return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border-main rounded-card">
        <div className="p-4 bg-white/5 rounded-full text-text-tertiary mb-4">
          <Building2 size={32} />
        </div>
        <h3 className="text-white font-bold">No companies joined yet</h3>
        <p className="text-text-secondary text-sm mt-1">Add your first company to start building your network.</p>
        <button 
          onClick={() => openDrawer()}
          className="mt-6 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white px-4 py-2 rounded-md font-bold transition-all"
        >
          Add Company
        </button>
      </div>
    );

    return (
      <div className="bg-bg-surface border border-border-main rounded-card overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-border-main bg-white/5">
              <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Company</th>
              <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Industry</th>
              <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Size</th>
              <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Website</th>
              <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-main">
            {companies?.filter(c => c && c.id).map((company) => (
              <tr key={company.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-brand-primary transition-colors">{company.name}</div>
                      <div className="text-xs text-text-tertiary">{company.domain || "no domain"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-text-secondary">{company.industry}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs px-2 py-1 bg-white/5 border border-border-main rounded text-text-secondary">
                    {company.company_size}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {company.website && (
                    <a 
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-text-tertiary hover:text-brand-primary transition-colors cursor-pointer group/link"
                    >
                      <Globe size={16} />
                      <span className="text-sm truncate max-w-[150px]">{company.website.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-100" />
                    </a>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openDrawer(company)}
                      title="Edit company"
                      className="p-1.5 hover:bg-white/10 rounded-md text-text-tertiary hover:text-brand-primary transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        const companyId = company.id || company._id;
                        if (companyId && confirm("Are you sure you want to delete this company?")) {
                          deleteMutation.mutate(companyId);
                        }
                      }}
                      title="Delete company"
                      className="p-1.5 hover:bg-white/10 rounded-md text-text-tertiary hover:text-danger transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Companies</h1>
          <p className="text-text-secondary text-sm">Manage your client organizations and accounts</p>
        </div>
        <button 
          onClick={() => openDrawer()}
          className="bg-brand-primary hover:bg-brand-accent text-white px-4 py-2 rounded-md font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-primary/20 transform active:scale-[0.98]"
        >
          <Plus size={18} />
          Add Company
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-bg-surface border border-border-main p-4 rounded-card flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
          <input 
            type="text" 
            placeholder="Search companies by name, domain, or industry..." 
            className="w-full bg-bg-page border border-border-input text-white pl-10 pr-4 py-2 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
          />
        </div>
        <button className="w-full sm:w-auto px-4 py-2 bg-white/5 border border-border-main text-text-secondary hover:text-white rounded-md flex items-center justify-center gap-2 transition-colors text-sm text-nowrap">
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
        title={selectedCompany ? "Edit Company" : "Add New Company"}
        description={selectedCompany ? "Update organization details" : "Add a new organization to your CRM"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="p-3 bg-danger/10 border border-danger text-danger text-xs rounded">
              {formError}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Company Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Acme Corporation" 
                className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Industry</label>
                <select 
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
                >
                  <option value="Technology">Technology</option>
                  <option value="Software">Software</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Finance">Finance</option>
                  <option value="Aviation">Aviation</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Company Size</label>
                <select 
                  value={formData.company_size}
                  onChange={(e) => setFormData({...formData, company_size: e.target.value})}
                  className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
                >
                  <option value="1-10">1-10 Employees</option>
                  <option value="11-50">11-50 Employees</option>
                  <option value="51-200">51-200 Employees</option>
                  <option value="201-500">201-500 Employees</option>
                  <option value="500+">500+ Employees</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Website URL</label>
              <input 
                type="text" 
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value, domain: e.target.value.replace(/^https?:\/\//, '').split('/')[0]})}
                placeholder="www.acme.com" 
                className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Company Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="contact@acme.com" 
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
              disabled={companyMutation.isPending}
              className="flex-1 bg-brand-primary hover:bg-brand-accent text-white font-bold py-3 rounded-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {companyMutation.isPending && <Loader2 className="animate-spin" size={18} />}
              {companyMutation.isPending ? "Saving..." : (selectedCompany ? "Update Company" : "Save Company")}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}

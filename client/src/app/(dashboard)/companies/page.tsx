"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Filter, Building2, Globe, ExternalLink, Loader2, LayoutGrid, List, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import SlideOver from "@/components/SlideOver";
import LoadingSpinner from "@/components/LoadingSpinner";
import NotesSection from "@/components/NotesSection";

interface Company {
  id?: string;
  _id?: string;
  name: string;
  domain?: string;
  industry?: string;
  company_size?: string;
  website: string;
  email: string;
  description?: string;
}

export default function CompaniesPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    industry: "Technology",
    company_size: "11-50",
    website: "",
    email: "",
    description: ""
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
      const companyId = selectedCompany?.id || selectedCompany?._id;
      if (companyId) {
        return api.put(`/companies/${companyId}`, data);
      }
      return api.post("/companies", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["people"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
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
      queryClient.invalidateQueries({ queryKey: ["people"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
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
        email: company.email || "",
        description: company.description || ""
      });
    } else {
      setSelectedCompany(null);
      setFormData({ name: "", domain: "", industry: "Technology", company_size: "11-50", website: "", email: "", description: "" });
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedCompany(null);
    setFormData({ name: "", domain: "", industry: "Technology", company_size: "11-50", website: "", email: "", description: "" });
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

    const validCompanies = companies?.filter(c => c && (c.id || c._id)) || [];

    if (validCompanies.length === 0) return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border-main rounded-card">
        <div className="p-4 bg-brand-primary/10 rounded-full text-brand-primary mb-4 p-6">
          <Building2 size={48} />
        </div>
        <h3 className="text-xl font-bold text-text-primary">No companies found</h3>
        <p className="text-text-secondary mt-2">Start by adding your first company to the CRM.</p>
        <button 
          onClick={() => openDrawer()}
          className="mt-6 btn-primary px-8"
        >
          Create Company
        </button>
      </div>
    );

    return (
      <div className="bg-bg-surface border border-border-main rounded-card overflow-hidden flex flex-col">
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-220px)]">
          {viewMode === 'table' ? (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 z-20 shadow-sm">
                <tr className="border-b border-border-main bg-bg-muted">
                  <th className="px-6 py-3 font-medium text-text-primary text-sm">Company</th>
                  <th className="px-6 py-3 font-medium text-text-primary text-sm">Industry</th>
                  <th className="px-6 py-3 font-medium text-text-primary text-sm">Size</th>
                  <th className="px-6 py-3 font-medium text-text-primary text-sm">Website</th>
                  <th className="px-6 py-3 font-medium text-text-primary text-sm text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {validCompanies.map((company) => (
                  <tr key={company.id || company._id} className="hover:bg-bg-muted/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                          <Building2 size={20} />
                        </div>
                        <div 
                          onClick={() => openDrawer(company)} 
                          className="cursor-pointer hover:text-brand-primary transition-colors group/name"
                        >
                          <div className="text-sm font-bold text-text-primary group-hover/name:text-brand-primary transition-colors">{company.name}</div>
                          <div className="text-xs text-text-tertiary">{company.domain || "no domain"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-secondary">{company.industry}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 bg-bg-muted border border-border-main rounded text-text-secondary">
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
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3 transition-opacity">
                        <button 
                          onClick={() => openDrawer(company)}
                          className="p-1 hover:text-brand-primary text-text-tertiary transition-colors"
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
                          className="p-1 hover:text-danger text-text-tertiary transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
              {validCompanies.map((company) => (
                <div key={company.id || company._id} className="bg-bg-surface border border-border-main rounded-card p-6 hover:border-brand-primary/40 transition-all group relative">
                   <div className="absolute top-4 right-4 flex gap-1 transition-opacity">
                    <button 
                      onClick={() => openDrawer(company)}
                      className="p-1 hover:text-brand-primary text-text-tertiary transition-colors"
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
                      className="p-1 hover:text-danger text-text-tertiary transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-md bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4 border border-brand-primary/20">
                      <Building2 size={32} />
                    </div>
                    <h3 
                      onClick={() => openDrawer(company)}
                      className="text-lg font-bold text-text-primary group-hover:text-brand-primary transition-colors cursor-pointer"
                    >
                      {company.name}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">{company.domain || "no domain"}</p>
                    
                    <div className="flex gap-2 mt-4">
                       <span className="text-xs px-2 py-1 bg-bg-muted border border-border-main rounded text-text-secondary">
                        {company.industry || "Technology"}
                      </span>
                      <span className="text-xs px-2 py-1 bg-bg-muted border border-border-main rounded text-text-secondary">
                        {company.company_size}
                      </span>
                    </div>

                    <div className="mt-6 w-full space-y-3 pt-6 border-t border-border-main text-left">
                       {company.website && (
                        <a 
                          href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-text-tertiary hover:text-text-primary transition-colors group/link"
                        >
                          <Globe size={16} className="flex-shrink-0" />
                          <span className="text-xs truncate">{company.website.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-100 ml-auto" />
                        </a>
                      )}
                      
                      {company.email && (
                        <div className="flex items-center gap-3 text-text-tertiary hover:text-text-primary transition-colors">
                           <div className="w-4 h-4 flex items-center justify-center">@</div>
                           <span className="text-xs truncate">{company.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Companies</h1>
          <p className="text-text-secondary text-sm">Manage your client organizations and accounts</p>
        </div>
        <button 
          onClick={() => openDrawer()}
          className="btn-primary flex items-center gap-2"
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
            className="w-full bg-bg-page border border-border-input text-text-primary pl-10 pr-4 py-2 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 border-l border-border-main pl-4 ml-2">
          <button 
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'table' 
                ? 'bg-brand-primary/10 text-brand-primary' 
                : 'text-text-tertiary hover:text-text-primary hover:bg-bg-muted'
            }`}
            title="List View"
          >
            <List size={18} />
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'grid' 
                ? 'bg-brand-primary/10 text-brand-primary' 
                : 'text-text-tertiary hover:text-text-primary hover:bg-bg-muted'
            }`}
            title="Grid View"
          >
            <LayoutGrid size={18} />
          </button>
        </div>
        <button className="w-full sm:w-auto btn-ghost border border-border-main flex items-center justify-center gap-2 shadow-sm">
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
        <form onSubmit={handleSubmit} id="company-form" className="space-y-6">
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
                className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Industry</label>
                <select 
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
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
                  className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
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
                className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Company Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="contact@acme.com" 
                className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
              />
            </div>

          </div>
        </form>

        {selectedCompany && (selectedCompany.id || selectedCompany._id) && (
          <NotesSection 
            relatedToType="company" 
            relatedToId={selectedCompany.id || selectedCompany._id || ""} 
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
            form="company-form"
            disabled={companyMutation.isPending}
            className="flex-1 btn-primary font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {companyMutation.isPending && <Loader2 className="animate-spin" size={18} />}
            {companyMutation.isPending ? "Saving..." : (selectedCompany ? "Update Company" : "Save Company")}
          </button>
        </div>
      </SlideOver>
    </div>
  );
}

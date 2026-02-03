"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Filter, Loader2, Package, Pencil, Trash2, Building2, IndianRupee } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import SlideOver from "@/components/SlideOver";
import LoadingSpinner from "@/components/LoadingSpinner";
import NotesSection from "@/components/NotesSection";
import Combobox from "@/components/Combobox";

interface Product {
  id?: string;
  _id?: string;
  name: string;
  code: string;
  description?: string;
  price: number;
  currency: string;
  category: string;
  status: string;
  company_id?: string;
}

export default function ProductsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "Software",
    price: "" as string | number,
    currency: "INR",
    status: "active",
    company_id: "",
    description: ""
  });
  const [formError, setFormError] = useState("");
  
  const queryClient = useQueryClient();

  // 1. Fetch Products
  const { data: products, isLoading, isError, error } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await api.get("/products/");
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

  // 3. Create/Update Product Mutation
  const productMutation = useMutation({
    mutationFn: (data: Partial<Product>) => {
      if (selectedProduct) {
        const productId = selectedProduct.id || selectedProduct._id;
        return api.put(`/products/${productId}`, data);
      }
      return api.post("/products/", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeDrawer();
    },
    onError: (err: unknown) => {
      setFormError(getErrorMessage(err));
    }
  });

  // 3. Delete Product Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });

  const openDrawer = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        code: product.code,
        category: product.category || "Software",
        price: product.price || 0,
        currency: product.currency || "INR",
        status: product.status || "active",
        company_id: product.company_id || "",
        description: product.description || ""
      });
    } else {
      setSelectedProduct(null);
      setFormData({ name: "", code: "", category: "Software", price: "", currency: "INR", status: "active", company_id: "", description: "" });
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedProduct(null);
    setFormError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const submissionData = {
      ...formData,
      price: Number(formData.price) || 0
    };
    productMutation.mutate(submissionData);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Products</h1>
          <p className="text-text-secondary text-sm">Manage your product catalog and pricing</p>
        </div>
        <button 
          onClick={() => openDrawer()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-bg-surface border border-border-main p-4 rounded-card flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
          <input 
            type="text" 
            placeholder="Search products by name or code..." 
            className="w-full bg-bg-page border border-border-input text-text-primary pl-10 pr-4 py-2 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm shadow-sm"
          />
        </div>
        <button className="px-4 py-2 btn-ghost border border-border-main flex items-center gap-2 shadow-sm">
          <Filter size={16} />
          Filters
        </button>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <LoadingSpinner message="Loading your catalog..." />
      ) : isError ? (
        <div className="p-8 bg-danger/10 border border-danger/20 rounded-card text-center">
          <p className="text-danger font-bold">Failed to load catalog</p>
          <p className="text-text-secondary text-sm mt-1">{getErrorMessage(error)}</p>
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ["products"] })}
            className="mt-4 text-brand-primary hover:underline text-sm font-bold"
          >
            Try again
          </button>
        </div>
      ) : (!products || products.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border-main rounded-card">
          <div className="p-4 bg-brand-primary/10 rounded-full text-brand-primary mb-4">
            <Package size={32} />
          </div>
          <h3 className="text-text-primary font-bold">No products found</h3>
          <p className="text-text-secondary text-sm mt-1">Start by adding your first product to the catalog.</p>
          <button 
            onClick={() => openDrawer()}
            className="mt-6 btn-primary"
          >
            Create Product
          </button>
        </div>
      ) : (
        /* Product Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products?.filter(p => p && (p.id || p._id)).map((product) => (
            <div key={product.id || product._id} className="bg-bg-surface border border-border-main rounded-card p-6 hover:border-brand-primary/40 transition-all group relative">
              <div className="absolute top-4 right-4 flex gap-1 transition-opacity">
                <button 
                  onClick={() => openDrawer(product)}
                  className="p-1 hover:text-brand-primary text-text-tertiary transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button 
                  onClick={() => {
                    const productId = product.id || product._id;
                    if (productId && confirm(`Delete ${product.name}?`)) deleteMutation.mutate(productId);
                  }}
                  className="p-1 hover:text-danger text-text-tertiary transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex justify-between items-start mb-4">
                <div className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                  product.status === 'active' ? 'bg-success/10 text-success border border-success/20' : 'bg-text-tertiary/10 text-text-tertiary border border-text-tertiary/20'
                }`}>
                  {product.status}
                </div>
              </div>
              
              <div className="min-h-[60px]">
                <h3 className="text-lg font-bold text-text-primary group-hover:text-brand-primary transition-colors line-clamp-1">{product.name}</h3>
                <p className="text-xs text-text-tertiary font-mono mt-1 uppercase tracking-widest">{product.code}</p>
                {product.company_id && (
                  <div className="flex items-center gap-1.5 mt-2 text-text-secondary">
                    <Building2 size={12} />
                    <span className="text-xs truncate max-w-[150px]">
                      {companies?.find(c => c.id === product.company_id)?.name || "Unknown Company"}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Starting from</p>
                  <p className="text-xl font-bold text-text-primary mt-1">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: product.currency }).format(product.price)}
                  </p>
                </div>
                <div className="px-3 py-1 bg-bg-muted rounded-full text-xs text-text-secondary border border-border-main">
                  {product.category}
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
        title={selectedProduct ? "Edit Product" : "Add New Product"}
        description={selectedProduct ? "Update product information" : "Add a new product to your catalog"}
      >
        <form onSubmit={handleSubmit} id="product-form" className="space-y-6">
          {formError && (
            <div className="p-3 bg-danger/10 border border-danger text-danger text-xs rounded">
              {formError}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Product Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enterprise CRM Plan" 
                className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Product Code</label>
                <input 
                  required
                  type="text" 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  placeholder="PRO-001" 
                  className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm uppercase"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Price (INR)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
                    <IndianRupee size={16} />
                  </div>
                  <input 
                    required
                    type="number" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    placeholder="4999" 
                    className="w-full bg-bg-muted border border-border-input text-text-primary pl-10 pr-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm no-spinners"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-bg-muted border border-border-input text-text-primary px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
              >
                <option value="Software">Software</option>
                <option value="Service">Service</option>
                <option value="Hardware">Hardware</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Associated Company</label>
              <Combobox 
                options={companies ? companies.filter(c => c && (c.id || c._id)).map(c => ({ id: (c.id || c._id || ""), label: c.name })) : []}
                value={formData.company_id}
                onChange={(val) => setFormData({...formData, company_id: val})}
                placeholder="Search for a company..."
              />
            </div>

          </div>
        </form>

        {selectedProduct && (selectedProduct.id || selectedProduct._id) && (
          <NotesSection 
            relatedToType="product" 
            relatedToId={selectedProduct.id || selectedProduct._id || ""} 
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
            form="product-form"
            disabled={productMutation.isPending}
            className="flex-1 btn-primary font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {productMutation.isPending && <Loader2 className="animate-spin" size={18} />}
            {productMutation.isPending ? "Saving..." : (selectedProduct ? "Update Product" : "Save Product")}
          </button>
        </div>
      </SlideOver>
    </div>
  );
}

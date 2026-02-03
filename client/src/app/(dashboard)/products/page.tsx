"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Filter, MoreVertical, Archive, Loader2, Package } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import SlideOver from "@/components/SlideOver";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Product {
  id: string;
  name: string;
  code: string;
  description?: string;
  price: number;
  currency: string;
  category: string;
  status: string;
}

export default function ProductsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "Software",
    price: 0,
    currency: "INR",
    status: "active",
    description: ""
  });
  const [formError, setFormError] = useState("");
  
  const queryClient = useQueryClient();

  // 1. Fetch Products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await api.get("/products/");
      return response.data;
    }
  });

  // 2. Create/Update Product Mutation
  const productMutation = useMutation({
    mutationFn: (data: any) => {
      if (selectedProduct) {
        return api.put(`/products/${selectedProduct.id}`, data);
      }
      return api.post("/products/", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeDrawer();
    },
    onError: (err: any) => {
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
        description: product.description || ""
      });
    } else {
      setSelectedProduct(null);
      setFormData({ name: "", code: "", category: "Software", price: 0, currency: "INR", status: "active", description: "" });
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
    productMutation.mutate(formData);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Products</h1>
          <p className="text-text-secondary text-sm">Manage your product catalog and pricing</p>
        </div>
        <button 
          onClick={() => openDrawer()}
          className="bg-brand-primary hover:bg-brand-accent text-white px-4 py-2 rounded-md font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-primary/20 transform active:scale-[0.98]"
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
            className="w-full bg-bg-page border border-border-input text-white pl-10 pr-4 py-2 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
          />
        </div>
        <button className="px-4 py-2 bg-white/5 border border-border-main text-text-secondary hover:text-white rounded-md flex items-center gap-2 transition-colors text-sm">
          <Filter size={16} />
          Filters
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <LoadingSpinner message="Loading your catalog..." />
      ) : (!products || products.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border-main rounded-card">
          <div className="p-4 bg-white/5 rounded-full text-text-tertiary mb-4">
            <Package size={32} />
          </div>
          <h3 className="text-white font-bold">No products found</h3>
          <p className="text-text-secondary text-sm mt-1">Start by adding your first product to the catalog.</p>
          <button 
            onClick={() => openDrawer()}
            className="mt-6 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white px-4 py-2 rounded-md font-bold transition-all"
          >
            Create Product
          </button>
        </div>
      ) : (
        /* Product Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products?.map((product) => (
            <div key={product.id} className="bg-bg-surface border border-border-main rounded-card p-6 hover:border-brand-primary/40 transition-all group relative">
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openDrawer(product)}
                  className="p-1 hover:text-brand-primary text-text-tertiary transition-colors"
                >
                  <Filter size={16} />
                </button>
                <button 
                  onClick={() => {
                    if (confirm(`Delete ${product.name}?`)) deleteMutation.mutate(product.id);
                  }}
                  className="p-1 hover:text-danger text-text-tertiary transition-colors"
                >
                  <MoreVertical size={16} />
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
                <h3 className="text-lg font-bold text-white group-hover:text-brand-primary transition-colors line-clamp-1">{product.name}</h3>
                <p className="text-xs text-text-tertiary font-mono mt-1 uppercase tracking-widest">{product.code}</p>
              </div>

              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Starting from</p>
                  <p className="text-xl font-bold text-white mt-1">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: product.currency }).format(product.price)}
                  </p>
                </div>
                <div className="px-3 py-1 bg-white/5 rounded-full text-xs text-text-secondary">
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
        <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors"
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
                  className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm uppercase"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Price (INR)</label>
                <input 
                  required
                  type="number" 
                  value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  placeholder="4999" 
                  className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm"
              >
                <option value="Software">Software</option>
                <option value="Service">Service</option>
                <option value="Hardware">Hardware</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Description</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of the product..." 
                className="w-full bg-bg-page border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm resize-none"
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
              disabled={productMutation.isPending}
              className="flex-1 bg-brand-primary hover:bg-brand-accent text-white font-bold py-3 rounded-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {productMutation.isPending && <Loader2 className="animate-spin" size={18} />}
              {productMutation.isPending ? "Saving..." : (selectedProduct ? "Update Product" : "Save Product")}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}

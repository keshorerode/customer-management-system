"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Lock, Mail, Globe, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { AuthLayout } from '@/components/AuthLayout';

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout mode="signup">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-text-main mb-2">Sign Up</h2>
        <p className="text-text-muted">Create an account to get started.</p>
      </div>

      <form className="space-y-5">
        
        {/* Name Field */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-text-main block" htmlFor="name">Name</label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
              <User size={18} />
            </div>
            <input 
              id="name"
              type="text" 
              placeholder="Name"
              className="w-full bg-[#fafafa] border border-[#d9d9d9] rounded-lg py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-text-muted/70"
              required
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-text-main block" htmlFor="email">Email</label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
              <Mail size={18} />
            </div>
            <input 
              id="email"
              type="email" 
              placeholder="Email"
              className="w-full bg-[#fafafa] border border-[#d9d9d9] rounded-lg py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-text-muted/70"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-text-main block" htmlFor="password">Password</label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
              <Lock size={18} />
            </div>
            <input 
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full bg-[#fafafa] border border-[#d9d9d9] rounded-lg py-3 pl-10 pr-10 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-text-muted/70"
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Country Field */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-text-main block" htmlFor="country">Country</label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors z-10">
              <Globe size={18} />
            </div>
            <select 
              id="country"
              defaultValue=""
              className="w-full bg-[#fafafa] border border-[#d9d9d9] rounded-lg py-3 pl-10 pr-10 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-text-main appearance-none cursor-pointer"
              required
            >
                <option value="" disabled>Select Country</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="India">India</option>
                <option value="Canada">Canada</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                <ChevronDown size={16} />
            </div>
          </div>
        </div>

        <button 
          type="button" 
          className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-all shadow-sm shadow-primary/30 active:scale-[0.98] mt-2"
        >
          Register
        </button>

        <div className="text-center mt-6">
          <Link href="/login" className="text-sm font-bold text-text-muted hover:text-primary transition-colors">
            Already Have Account Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

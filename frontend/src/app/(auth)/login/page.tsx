"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Lock, Eye, EyeOff, CheckSquare, Square } from 'lucide-react';
import { AuthLayout } from '@/components/AuthLayout';

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <AuthLayout mode="signin">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-text-main mb-2">Sign In</h2>
        <p className="text-text-muted">Welcome back! Please enter your details.</p>
      </div>

      <form className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-main block" htmlFor="email">Email</label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
              <User size={18} />
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
        <div className="space-y-2">
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

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button 
            type="button" 
            onClick={() => setRememberMe(!rememberMe)}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text-main transition-colors"
          >
            {rememberMe ? (
              <CheckSquare size={16} className="text-primary" />
            ) : (
              <Square size={16} />
            )}
            Remember me
          </button>
          <Link href="#" className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors">
            Forgot Password?
          </Link>
        </div>

        <button 
          type="button" 
          className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-all shadow-sm shadow-primary/30 active:scale-[0.98]"
        >
          Log In
        </button>

        <div className="text-center mt-6">
          <Link href="/register" className="text-sm font-medium text-text-muted hover:text-primary transition-colors">
            Or Register Now!
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

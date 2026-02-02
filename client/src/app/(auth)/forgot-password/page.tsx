"use client"

import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="space-y-8 animate-in zoom-in duration-500 text-center">
        <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Check your inbox</h2>
          <p className="text-text-secondary leading-relaxed">
            We've sent a password reset link to <br />
            <span className="text-white font-semibold">alex@company.com</span>
          </p>
        </div>
        <button 
          onClick={() => setSubmitted(false)}
          className="w-full bg-bg-surface border border-border-main text-white py-3 rounded-md hover:bg-white/5 transition-colors font-bold"
        >
          Resend email
        </button>
        <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-text-tertiary hover:text-text-primary transition-colors">
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <Link href="/login" className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-primary transition-colors mb-8">
          <ArrowLeft size={16} />
          Back to login
        </Link>
        <h2 className="text-3xl font-bold text-white mb-2">Forgot password?</h2>
        <p className="text-text-secondary">No worries, we'll send you reset instructions.</p>
      </div>

      <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
            <input 
              type="email" 
              placeholder="alex@company.com" 
              required
              className="w-full bg-[#1D2029] border border-border-input text-white pl-10 pr-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>
        </div>

        <button className="w-full bg-brand-primary hover:bg-brand-accent text-white font-bold py-3 rounded-md transition-all shadow-lg shadow-brand-primary/20 transform active:scale-[0.98]">
          Reset Password
        </button>
      </form>

      <p className="text-center text-text-secondary text-sm">
        Remembered your password?{" "}
        <Link href="/login" className="text-brand-primary font-bold hover:text-brand-accent transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
}

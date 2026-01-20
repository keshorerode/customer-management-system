"use client";

import React from 'react';
import { Mountain } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  mode: 'signin' | 'signup';
}

export function AuthLayout({ children, mode }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
      <div className="w-full max-w-[1200px] bg-bg-card rounded-2xl shadow-xl overflow-hidden min-h-[700px] flex animate-in slide-in-from-bottom-2 duration-500 border border-border">
        
        {/* Left Side - Brand/Promotion */}
        <div className="hidden lg:flex w-1/2 bg-primary relative p-12 flex-col justify-between overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-primary">
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px'
            }}></div>
             <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1] 
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              className="absolute -right-20 -bottom-20 w-96 h-96 bg-white rounded-full blur-3xl opacity-10"
            />
             <motion.div 
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.1, 0.15, 0.1] 
              }}
              transition={{ 
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
              className="absolute -left-20 top-20 w-72 h-72 bg-blue-300 rounded-full blur-3xl opacity-10"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 text-white">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20">
                <Mountain size={20} className="text-white" />
              </div>
              <span className="font-bold text-2xl tracking-tight">WERSEL</span>
            </div>
            
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Manage Your Company<br/>With All In One Tool
            </h2>
            <p className="text-blue-100 text-lg max-w-md">
              Streamline your workflow and boost productivity with our comprehensive CRM solution.
            </p>
          </div>

          {/* Features */}
          <div className="relative z-10 space-y-6">
             <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 transform hover:translate-x-2 transition-transform duration-300 cursor-default">
                <h3 className="text-white font-bold mb-1">All In One Tool</h3>
                <p className="text-blue-100/80 text-sm">Run and scale your ERP CRM apps</p>
             </div>
             
             <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 transform hover:translate-x-2 transition-transform duration-300 delay-100 cursor-default">
                <h3 className="text-white font-bold mb-1">Easily Manage Services</h3>
                <p className="text-blue-100/80 text-sm">Brings together your invoice, clients, and leads</p>
             </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex items-center justify-center bg-white relative">
            <div className="w-full max-w-md space-y-8">
                {children}
            </div>
        </div>

      </div>
    </div>
  );
}

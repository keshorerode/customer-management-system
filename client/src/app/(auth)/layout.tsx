export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-bg-page overflow-hidden">
      {/* Left Side: Brand/Marketing */}
      <div className="hidden lg:flex w-1/2 bg-bg-sidebar relative items-center justify-center p-12 border-r border-border-main">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="relative z-10 w-full max-w-md">
          <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center font-bold text-white text-2xl mb-8 shadow-lg shadow-brand-primary/20">
            RP
          </div>
          <h1 className="text-4xl font-bold text-white mb-6 tracking-tight leading-tight">
            Build Deeper Relationships with <span className="text-brand-primary">Precision.</span>
          </h1>
          <p className="text-text-secondary text-lg mb-10">
            The modern CRM for teams who value speed, data clarity, and premium aesthetics.
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
              <div className="text-xl font-bold text-white mb-1">100%</div>
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold">Gmail Sync</div>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
              <div className="text-xl font-bold text-white mb-1">Fast</div>
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold">Latency</div>
            </div>
          </div>
        </div>

        {/* Floating Credit Card / Mockup purely for aesthetic */}
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-brand-primary/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Right Side: Form Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-page p-4">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-brand-primary rounded-2xl flex items-center justify-center font-bold text-white text-3xl mx-auto shadow-lg shadow-brand-primary/20">
          RP
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Relationship Pro CRM</h1>
        <p className="text-text-secondary max-w-md mx-auto">
          The premium boutique CRM for high-performance teams. 
          Manage leads, companies, and deals with ease.
        </p>
        
        <div className="flex gap-4 justify-center pt-4">
          <Link 
            href="/dashboard" 
            className="px-8 py-3 bg-brand-primary hover:bg-brand-accent text-white font-bold rounded-lg transition-all transform hover:scale-105"
          >
            Go to Dashboard
          </Link>
          <Link 
            href="/login" 
            className="px-8 py-3 bg-bg-surface border border-border-main text-white font-bold rounded-lg hover:bg-white/5 transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

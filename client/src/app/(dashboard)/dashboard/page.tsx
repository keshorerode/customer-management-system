import { ArrowUpRight, ArrowDownRight, Users, Briefcase, FileText, CheckSquare } from "lucide-react";

const stats = [
  { name: "Total Leads", value: "124", change: "+12.5%", icon: FileText, positive: true },
  { name: "Open Deals", value: "45", change: "+3.2%", icon: Briefcase, positive: true },
  { name: "Total Revenue", value: "₹12.5L", change: "-2.1%", icon: Users, positive: false },
  { name: "Tasks Today", value: "8", icon: CheckSquare, positive: true },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-bg-surface border border-border-main p-6 rounded-card">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/5 rounded-md text-brand-primary">
                <stat.icon size={20} />
              </div>
              {stat.change && (
                <div className={`flex items-center text-xs font-bold ${stat.positive ? 'text-success' : 'text-danger'}`}>
                  {stat.change}
                  {stat.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </div>
              )}
            </div>
            <div>
              <div className="text-text-secondary text-sm font-medium">{stat.name}</div>
              <div className="text-2xl font-bold text-white mt-1">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Placeholder */}
        <div className="lg:col-span-2 bg-bg-surface border border-border-main rounded-card p-6 min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white">Sales Pipeline</h3>
            <select className="bg-bg-page border border-border-main text-xs text-text-secondary rounded px-2 py-1 outline-none">
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>
          </div>
          <div className="flex items-center justify-center h-[300px] text-text-tertiary border-2 border-dashed border-border-main rounded-md">
            Chart Visualization Prototype
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-bg-surface border border-border-main rounded-card p-6">
          <h3 className="font-bold text-white mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary text-xs font-bold">
                  JS
                </div>
                <div>
                  <div className="text-sm text-white">
                    <span className="font-bold">John Smith</span> moved <span className="text-brand-primary font-medium">Acme Corp</span> to <span className="text-success font-medium">Qualified</span>
                  </div>
                  <div className="text-xs text-text-tertiary mt-1">2 hours ago</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Briefcase, 
  CheckSquare, 
  FileText, 
  Settings, 
  UserCircle,
  Package
} from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: FileText },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "People", href: "/people", icon: Users },
  { name: "Products", href: "/products", icon: Package },
  { name: "Deals", href: "/deals", icon: Briefcase },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
];

const supportItems = [
  { name: "User Profile", href: "/profile", icon: UserCircle },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    Cookies.remove("token");
    router.push("/login");
  };

  const renderNavItem = (item: { name: string; href: string; icon: any }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.name}
        href={item.href}
        className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
          isActive 
            ? "bg-brand-primary/10 text-brand-primary" 
            : "text-text-secondary hover:text-text-primary hover:bg-white/5"
        }`}
      >
        <item.icon size={20} />
        <span className="font-medium">{item.name}</span>
      </Link>
    );
  };

  const initials = user 
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "?"
    : "RP";

  return (
    <aside className="w-[260px] bg-bg-sidebar border-r border-border-main flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-primary rounded-md flex items-center justify-center font-bold text-white">
            RP
          </div>
          <div>
            <div className="font-bold text-white text-sm">Relationship Pro</div>
            <div className="text-[10px] text-text-tertiary font-bold tracking-widest uppercase">Workspace</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(renderNavItem)}
        
        <div className="pt-8 pb-2 px-4">
          <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Support</span>
        </div>
        {supportItems.map(renderNavItem)}
      </nav>

      <div className="p-4 border-t border-border-main">
        <div 
          onClick={handleLogout}
          className="flex items-center gap-3 p-2 rounded-md hover:bg-danger/10 group cursor-pointer transition-colors"
        >
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt="Profile" 
              className="w-8 h-8 rounded-full object-cover border border-white/10"
            />
          ) : (
            <div className="w-8 h-8 bg-brand-accent group-hover:bg-danger rounded-full flex items-center justify-center text-xs font-bold text-white transition-colors">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate group-hover:text-danger">
              {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
            </div>
            <div className="text-xs text-text-tertiary truncate">Logout</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

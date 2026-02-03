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
  Package,
  X,
  LucideIcon,
  StickyNote
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
  { name: "Notes", href: "/notes", icon: StickyNote },
];

const supportItems = [
  { name: "User Profile", href: "/profile", icon: UserCircle },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    Cookies.remove("token");
    router.push("/login");
  };

  const renderNavItem = (item: { name: string; href: string; icon: LucideIcon }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.name}
        href={item.href}
        className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
          isActive 
            ? "bg-brand-primary/10 text-brand-primary font-semibold" 
            : "text-text-secondary hover:text-text-primary hover:bg-bg-muted"
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
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed lg:sticky top-0 left-0 z-50 w-[260px] bg-bg-sidebar border-r border-border-main flex flex-col h-screen transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-primary rounded-md flex items-center justify-center font-bold text-white shadow-lg shadow-brand-primary/20">
              RP
            </div>
            <div>
              <div className="font-bold text-text-primary text-sm">Relationship Pro</div>
              <div className="text-[10px] text-text-tertiary font-bold tracking-widest uppercase">Workspace</div>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="lg:hidden text-text-tertiary hover:text-text-primary p-1"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(renderNavItem)}
          
          <div className="pt-8 pb-2 px-4">
            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Support</span>
          </div>
          {supportItems.map(renderNavItem)}
        </nav>

        <div className="p-4 border-t border-border-main">
          <div 
            onClick={handleLogout}
            className="flex items-center gap-3 p-2 rounded-md hover:bg-danger/5 group cursor-pointer transition-colors"
          >
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover border border-border-main"
                />
              ) : (
              <div className="w-8 h-8 bg-brand-accent/10 text-brand-primary group-hover:bg-danger/10 group-hover:text-danger rounded-full flex items-center justify-center text-xs font-bold transition-colors">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-text-primary truncate group-hover:text-danger">
                {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
              </div>
              <div className="text-xs text-text-tertiary truncate">Logout</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

"use client";

import Link from "next/link";
import { 
  LayoutDashboard, 
  FileText, 
  Activity, 
  Heart,
  Settings,
  LogOut,
  ShieldCheck
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { clearServerSession } from "@/lib/auth-session-client";

interface SidebarProps {
  activePath?: string;
}

export default function Sidebar({ activePath = "/dashboard" }: SidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    await clearServerSession();
    router.push("/");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: FileText, label: "Records", href: "/dashboard" }, // Using dashboard as records for now as per existing structure
    { icon: Activity, label: "Vitals", href: "/dashboard" },
  ];

  return (
    <aside className="hidden lg:flex w-20 xl:w-72 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen transition-all duration-500 ease-in-out group/sidebar">
      <div className="p-6 xl:p-8 flex items-center gap-4">
        <div className="bg-rose-600 p-2.5 rounded-xl shadow-lg shadow-rose-200 group-hover/sidebar:rotate-[10deg] transition-transform">
          <Heart className="w-5 h-5 text-white fill-white/20" />
        </div>
        <span className="hidden xl:block text-base font-black text-slate-950 tracking-tighter uppercase italic">Health<span className="text-rose-600">Med</span></span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item, idx) => {
          const isActive = activePath === item.href || (item.label === "Records" && activePath === "/dashboard/records");
          return (
            <Link 
              key={idx} 
              href={item.href} 
              className={`w-full flex items-center justify-center xl:justify-start gap-4 p-3.5 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-slate-950 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50/50'}`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-rose-500' : ''}`} />
              <span className="hidden xl:block text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              {isActive && <div className="hidden xl:block ml-auto w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-50 space-y-2">
        <Link href="/dashboard/settings" className="w-full flex items-center justify-center xl:justify-start gap-4 p-3.5 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all group">
          <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
          <span className="hidden xl:block text-[10px] font-black uppercase tracking-widest">Settings</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center xl:justify-start gap-4 p-3.5 rounded-2xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden xl:block text-[10px] font-black uppercase tracking-widest">Security Exit</span>
        </button>
      </div>
    </aside>
  );
}

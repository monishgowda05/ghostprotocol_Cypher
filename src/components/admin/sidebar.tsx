import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Settings, Users, ArrowUpRight } from "lucide-react";

export function Sidebar() {
  return (
    <div className="w-64 border-r border-white/10 bg-black h-screen sticky top-0 flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400">
          StoreOS
        </span>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <NavItem href="/admin" icon={LayoutDashboard} label="Overview" active />
        <NavItem href="/admin/products" icon={Package} label="Products" />
        <NavItem href="/admin/orders" icon={ShoppingCart} label="Orders" />
        <NavItem href="/admin/customers" icon={Users} label="Customers" />
        
        <div className="pt-8 pb-2">
          <p className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Settings
          </p>
        </div>
        <NavItem href="/admin/settings" icon={Settings} label="Store Settings" />
      </div>

      <div className="p-4 border-t border-white/10">
        <Link href="/" target="_blank" className="flex items-center justify-between px-4 py-2 text-sm text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <span>View Store</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function NavItem({ href, icon: Icon, label, active }: { href: string, icon: any, label: string, active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active 
          ? "bg-violet-500/10 text-violet-400" 
          : "text-neutral-400 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}

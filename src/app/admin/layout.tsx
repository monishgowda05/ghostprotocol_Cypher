import { Sidebar } from "@/components/admin/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-black text-white selection:bg-violet-500/30">
      <Sidebar />
      <main className="flex-1 border-l border-white/10 bg-zinc-950/50">
        {children}
      </main>
    </div>
  );
}

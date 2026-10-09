"use client";
import { motion } from "framer-motion";
import { DollarSign, CreditCard, Activity, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-neutral-500 mt-1">Overview of your store's performance.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Revenue" value="$45,231.89" change="+20.1% from last month" icon={DollarSign} delay={0.1} />
        <StatCard title="Orders" value="+2,350" change="+180.1% from last month" icon={CreditCard} delay={0.2} />
        <StatCard title="Active Visitors" value="+12,234" change="+19% from last month" icon={Activity} delay={0.3} />
        <StatCard title="Products" value="142" change="12 low in stock" icon={Package} delay={0.4} />
      </div>
      
      {/* Placeholder for charts and recent orders */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-black border-white/10 text-white">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-white/10 mt-4">
            <p className="text-neutral-500 text-sm">Chart rendering goes here (Recharts)</p>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-black border-white/10 text-white">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent className="border-t border-white/10 mt-4 pt-4">
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-neutral-800" />
                    <div>
                      <p className="text-sm font-medium">Customer {i}</p>
                      <p className="text-xs text-neutral-500">user{i}@example.com</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium font-mono text-emerald-400">
                    +${(14.5 * i + 23.4).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon: Icon, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="bg-black border-white/10 text-white overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-400">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-neutral-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-neutral-500 mt-1">
            {change}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Download, Edit, Trash2, Package, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Papa from "papaparse";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const supabase = createClient();
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const importDummyProducts = async () => {
    setIsImporting(true);
    const supabase = createClient();
    
    // Grab the first store to attach products to (for demo purposes)
    const { data: stores } = await supabase.from("stores").select("id").limit(1);
    if (!stores || stores.length === 0) {
      alert("Please create a store via the wizard first!");
      setIsImporting(false);
      return;
    }
    const storeId = stores[0].id;

    const dummyProducts = [
      { store_id: storeId, name: "Aceternity Wireless Headphones", price: 299.99, stock: 45, category: "Electronics" },
      { store_id: storeId, name: "Minimalist Desk Lamp", price: 89.00, stock: 12, category: "Home" },
      { store_id: storeId, name: "Mechanical Keyboard Pro", price: 150.00, stock: 8, category: "Electronics" },
      { store_id: storeId, name: "Ergonomic Mesh Chair", price: 399.00, stock: 0, category: "Office" },
      { store_id: storeId, name: "Ceramic Coffee Dripper", price: 24.50, stock: 120, category: "Kitchen" }
    ];

    await supabase.from("products").insert(dummyProducts);
    await fetchProducts();
    setIsImporting(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const supabase = createClient();
        const { data: stores } = await supabase.from("stores").select("id").limit(1);
        
        if (!stores || stores.length === 0) {
          alert("Create a store first!");
          setIsImporting(false);
          return;
        }
        
        const newProducts = results.data.map((row: any) => ({
          store_id: stores[0].id,
          name: row.name || row.Name || "Unnamed Product",
          price: parseFloat(row.price || row.Price || "0"),
          stock: parseInt(row.stock || row.Stock || "0"),
          category: row.category || row.Category || "Uncategorized"
        })).filter(p => p.name !== "Unnamed Product");

        await supabase.from("products").insert(newProducts);
        await fetchProducts();
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      error: (err) => {
        alert("Error parsing CSV: " + err.message);
        setIsImporting(false);
      }
    });
  };

  const deleteProduct = async (id: string) => {
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", id);
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Products</h1>
          <p className="text-neutral-500 mt-1">Manage your inventory, pricing, and variants.</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <Button 
            variant="outline" 
            className="bg-black border-white/10 text-white hover:bg-white/5"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload CSV
          </Button>
          <Button 
            variant="outline" 
            className="bg-black border-white/10 text-white hover:bg-white/5"
            onClick={importDummyProducts}
            disabled={isImporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {isImporting ? "Importing..." : "Import Dummy Products"}
          </Button>
          <Button className="bg-white text-black hover:bg-neutral-200">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <Card className="bg-black border-white/10 text-white overflow-hidden rounded-xl">
        <CardHeader className="border-b border-white/10 bg-white/5 pb-4">
          <CardTitle className="text-lg font-medium">Inventory ({products.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-neutral-500">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                <Package className="w-8 h-8 text-neutral-500" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No products found</h3>
              <p className="text-neutral-500 mb-8 max-w-sm">Get started by creating your first product or import realistic dummy data to test the platform.</p>
              <div className="flex justify-center gap-4 mt-6">
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="bg-black border-white/10 text-white hover:bg-white/5">
                  <Upload className="w-4 h-4 mr-2" /> Upload CSV
                </Button>
                <Button onClick={importDummyProducts} className="bg-white text-black hover:bg-neutral-200 px-8">
                  Import Dummy Products
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-neutral-500 uppercase bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 font-medium">Product Name</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Inventory</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium text-right">Price</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-medium text-white">{product.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold ${product.stock > 10 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : product.stock > 0 ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {product.stock > 10 ? 'Active' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-400">{product.stock} in stock</td>
                      <td className="px-6 py-4 text-neutral-400">{product.category || 'Uncategorized'}</td>
                      <td className="px-6 py-4 text-right text-white font-mono">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-neutral-400 hover:text-white transition-colors rounded-md hover:bg-white/10">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteProduct(product.id)} className="p-2 text-red-400 hover:text-red-300 transition-colors rounded-md hover:bg-red-500/10">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

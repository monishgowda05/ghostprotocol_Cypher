-- Run this script in your Supabase SQL Editor to instantly setup the database!

-- 1. Create the stores table
CREATE TABLE stores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_name TEXT NOT NULL,
    domain TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    category TEXT NOT NULL,
    business_type TEXT NOT NULL,
    theme TEXT NOT NULL DEFAULT 'dark',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Setup Row Level Security (RLS)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone to insert a store (for the onboarding wizard)
CREATE POLICY "Allow public insert to stores" ON stores FOR INSERT WITH CHECK (true);

-- 4. Create the products table (For later use in the Admin dashboard)
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Setup RLS for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 6. Allow reading products by anyone (storefront visitors)
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (true);

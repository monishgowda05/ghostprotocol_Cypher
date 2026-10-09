import { groq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  try {
    const { prompt, email } = await req.json();

    const result = await generateObject({
      model: groq('llama3-8b-8192'),
      schema: z.object({
        storeName: z.string().describe('A catchy, professional name for the store'),
        domain: z.string().describe('A URL-friendly domain slug (lowercase, no spaces)'),
        category: z.string().describe('Primary category (e.g., clothing, electronics)'),
        theme: z.enum(['Light Minimal', 'Dark Minimal', 'Neon', 'Elegant']),
        products: z.array(z.object({
          name: z.string(),
          price: z.number(),
          stock: z.number(),
          category: z.string(),
          image_url: z.string().describe('A realistic placeholder image URL from Unsplash. Use format: https://images.unsplash.com/photo-[ID]?w=400&h=400&fit=crop')
        })).length(5).describe('Generate exactly 5 realistic dummy products for this store')
      }),
      prompt: `Generate a complete e-commerce store setup based on this user request: "${prompt}". Provide 5 realistic dummy products with sensible prices and stock levels.`,
    });

    const { storeName, domain, category, theme, products } = result.object;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Create the store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert({
        name: storeName,
        domain: domain,
        owner_email: email || 'ai@example.com',
        theme: theme
      })
      .select()
      .single();

    if (storeError) {
      console.error('Store creation error:', storeError);
      return NextResponse.json({ error: 'Failed to save store to database' }, { status: 500 });
    }

    // 2. Insert the products
    const productsToInsert = products.map((p) => ({
      store_id: store.id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      category: p.category,
      image_url: p.image_url || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&h=400&fit=crop'
    }));

    const { error: productsError } = await supabase.from('products').insert(productsToInsert);

    if (productsError) {
      console.error('Products insertion error:', productsError);
    }

    return NextResponse.json({ success: true, store, products });
  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate store' }, { status: 500 });
  }
}

import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { createClient } from '@supabase/supabase-js';

// We create a direct server-side supabase client to read products securely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Fetch the actual inventory to inject into the system prompt (Checkpoint 14: LLM context)
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: products } = await supabase.from('products').select('*');
  
  const systemPrompt = `
    You are the AI assistant for an e-commerce store built on StoreOS.
    Your job is to answer customer questions accurately and professionally. 
    
    Here is the live inventory of the store right now:
    ${JSON.stringify(products)}
    
    CRITICAL RULES:
    1. Do NOT hallucinate products. Only recommend products that are explicitly in the inventory list above.
    2. Be concise and polite.
    3. If a product is out of stock (stock <= 0), mention that it is currently unavailable.
    4. If the user asks for a price, provide exactly what is listed.
  `;

  // Start the streaming AI response using Groq
  const result = await streamText({
    model: groq('llama3-8b-8192'),
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
  });

  return result.toTextStreamResponse();
}

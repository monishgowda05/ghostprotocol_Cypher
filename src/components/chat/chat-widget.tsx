"use client";
import { useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatWidget() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <ChatWidgetInner />;
}

function ChatWidgetInner() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat() as any;

  return (
    <div className="z-50 relative">
      {/* Toggle Button */}
      <Button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.3)] bg-violet-600 hover:bg-violet-700 transition-all duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </Button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-50 opacity-0 pointer-events-none'}`}>
        <div className="flex items-center justify-between p-4 bg-white/5 border-b border-white/10">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              Store Assistant
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h3>
            <p className="text-xs text-neutral-400">Powered by OpenAI</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 text-neutral-400 hover:text-white rounded-md transition-colors hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto h-[400px] flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="text-center text-sm text-neutral-500 my-auto px-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 border border-white/10">
                <MessageCircle className="w-6 h-6 text-neutral-400" />
              </div>
              Ask me about our products, pricing, or stock availability! I'm connected directly to the database.
            </div>
          ) : (
            messages.map((m: any) => (
              <div key={m.id} className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${m.role === 'user' ? 'bg-violet-600 text-white self-end rounded-br-none' : 'bg-white/10 text-neutral-200 self-start rounded-bl-none border border-white/5'}`}>
                {m.content}
              </div>
            ))
          )}
          {isLoading && (
            <div className="bg-white/10 text-neutral-200 self-start rounded-xl rounded-bl-none px-4 py-2.5 text-sm max-w-[85%] border border-white/5">
              <span className="flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-3 bg-white/5 border-t border-white/10 flex gap-2">
          <input 
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
          />
          <Button type="submit" disabled={!input.trim() || isLoading} className="bg-white text-black hover:bg-neutral-200 h-10 w-10 p-0 shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

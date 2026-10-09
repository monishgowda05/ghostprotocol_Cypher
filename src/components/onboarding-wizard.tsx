"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, Paintbrush, Package, CheckCircle2, Sparkles, Wand2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const step1Schema = z.object({
  storeName: z.string().min(2, "Store name is required"),
  domain: z.string().min(2, "Domain is required"),
  email: z.string().email("Invalid email"),
});

const step2Schema = z.object({
  category: z.string().min(1, "Please select a category"),
  businessType: z.string().min(1, "Please select a business type"),
});

const step3Schema = z.object({
  theme: z.string().min(1, "Please select a theme"),
});

const formSchema = step1Schema.merge(step2Schema).merge(step3Schema);
type FormValues = z.infer<typeof formSchema>;

const steps = [
  { id: 1, title: "Store Details", icon: Store, description: "Let's start with the basics." },
  { id: 2, title: "Categories", icon: Package, description: "What are you selling?" },
  { id: 3, title: "Theme", icon: Paintbrush, description: "Make it yours." },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    shouldUnregister: false,
    defaultValues: { storeName: "", domain: "", email: "", category: "", businessType: "", theme: "dark" },
  });

  const nextStep = async () => {
    let fieldsToValidate: any = [];
    if (currentStep === 1) fieldsToValidate = ["storeName", "domain", "email"];
    if (currentStep === 2) fieldsToValidate = ["category", "businessType"];
    if (currentStep === 3) fieldsToValidate = ["theme"];
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const onSubmit = async () => {
    setIsSubmitting(true);
    const data = form.getValues();
    
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('stores')
        .insert([
          {
            store_name: data.storeName,
            domain: data.domain,
            email: data.email,
            category: data.category,
            business_type: data.businessType,
            theme: data.theme,
          }
        ]);

      if (error) {
        console.error("Supabase Error:", error);
        alert(`Supabase Error: ${error.message || JSON.stringify(error)}`);
        throw error;
      }
      
      setIsSubmitting(false);
      setCurrentStep(4);
      setTimeout(() => {
        router.push("/admin");
      }, 2000);
    } catch (error: any) {
      console.error("Error creating store:", error);
      setIsSubmitting(false);
      if (!error.message) {
         alert("Failed to create store. Check the console for details. (Did you restart the dev server?)");
      }
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, email: form.getValues().email || 'ai@example.com' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Success
      setIsGenerating(false);
      setCurrentStep(4);
      setTimeout(() => {
        router.push("/admin");
      }, 2000);
    } catch (error: any) {
      console.error(error);
      alert("Failed to generate store via AI: " + (error.message || error));
      setIsGenerating(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as any } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-6 md:p-8 shadow-input bg-black border border-white/10 relative z-10 text-white">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
        <h2 className="font-bold text-xl text-neutral-200">
          {currentStep === 4 ? "Success" : steps[currentStep - 1]?.title}
        </h2>
        {currentStep === 1 && (
          <button 
            onClick={() => setIsAiMode(!isAiMode)}
            className="flex items-center gap-1.5 text-xs font-medium bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-full border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isAiMode ? "Manual Setup" : "AI Magic Mode"}
          </button>
        )}
        {currentStep > 1 && currentStep < 4 && (
          <div className="text-sm font-mono text-neutral-500">
            Step {currentStep} of 3
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentStep + (isAiMode ? 'ai' : 'manual')} variants={formVariants} initial="hidden" animate="visible" exit="exit">
          {isAiMode && currentStep === 1 ? (
            <div className="space-y-6">
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                <h3 className="text-indigo-300 font-medium flex items-center gap-2 mb-2">
                  <Wand2 className="w-4 h-4" /> Text-to-Store Generation
                </h3>
                <p className="text-sm text-indigo-200/70">
                  Describe what kind of store you want to build. Our AI will instantly generate the brand name, theme, and 5 fully-priced dummy products in your database!
                </p>
              </div>
              
              <LabelInputContainer>
                <Label htmlFor="aiPrompt">What are you selling?</Label>
                <textarea 
                  id="aiPrompt" 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. I want to sell premium high-protein gym supplements and pre-workout for athletes." 
                  className="min-h-[120px] bg-zinc-900 border-none rounded-md p-3 text-sm text-white placeholder-neutral-500 focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                />
              </LabelInputContainer>

              <button
                onClick={handleAiGenerate}
                disabled={isGenerating || !aiPrompt.trim()}
                className="w-full relative group/btn bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isGenerating ? "AI is building your store (takes ~10s)..." : "Generate Store & Inventory"}
              </button>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 1 && (
              <>
                <LabelInputContainer>
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input id="storeName" placeholder="My Awesome Store" {...form.register("storeName")} />
                  {form.formState.errors.storeName && <ErrorMsg msg={form.formState.errors.storeName?.message as string} />}
                </LabelInputContainer>
                
                <LabelInputContainer>
                  <Label htmlFor="domain">Unique Subdomain</Label>
                  <div className="flex items-center">
                    <Input id="domain" placeholder="my-store" {...form.register("domain")} className="rounded-r-none" />
                    <div className="h-10 px-4 flex items-center bg-zinc-900 border border-l-0 border-white/10 rounded-r-md text-xs text-neutral-500">
                      .launchyourstore.com
                    </div>
                  </div>
                  {form.formState.errors.domain && <ErrorMsg msg={form.formState.errors.domain?.message as string} />}
                </LabelInputContainer>

                <LabelInputContainer>
                  <Label htmlFor="email">Contact Email</Label>
                  <Input id="email" type="email" placeholder="hello@example.com" {...form.register("email")} />
                  {form.formState.errors.email && <ErrorMsg msg={form.formState.errors.email?.message as string} />}
                </LabelInputContainer>
              </>
            )}

            {currentStep === 2 && (
              <>
                <LabelInputContainer>
                  <Label>Primary Category</Label>
                  <Select onValueChange={(v: string | null) => v && form.setValue("category", v)}>
                    <SelectTrigger className="h-10 bg-zinc-900 border-none rounded-md text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      <SelectItem value="clothing">Clothing & Apparel</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="digital">Digital Products</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && <ErrorMsg msg={form.formState.errors.category?.message as any} />}
                </LabelInputContainer>

                <LabelInputContainer>
                  <Label>Business Type</Label>
                  <Select onValueChange={(v: string | null) => v && form.setValue("businessType", v)}>
                    <SelectTrigger className="h-10 bg-zinc-900 border-none rounded-md text-white">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      <SelectItem value="retail">Retail / Physical</SelectItem>
                      <SelectItem value="services">Services / Booking</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.businessType && <ErrorMsg msg={form.formState.errors.businessType?.message as any} />}
                </LabelInputContainer>
              </>
            )}

            {currentStep === 3 && (
              <LabelInputContainer>
                <Label>Select Base Theme</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {['Light Minimal', 'Dark Minimal', 'Neon', 'Elegant'].map((t) => (
                    <div 
                      key={t} onClick={() => form.setValue("theme", t)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all text-sm text-center ${
                        form.watch("theme") === t ? "border-neutral-200 bg-neutral-900 text-white" : "border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300"
                      }`}
                    >
                      {t}
                    </div>
                  ))}
                </div>
                {form.formState.errors.theme && <ErrorMsg msg={form.formState.errors.theme?.message as string} />}
              </LabelInputContainer>
            )}

            {currentStep === 4 && (
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <CheckCircle2 className="w-16 h-16 text-neutral-300" />
                <p className="text-neutral-400 text-center text-sm">Store generated successfully. Redirecting to admin console...</p>
              </div>
            )}
          </form>
          )}
        </motion.div>
      </AnimatePresence>

      {currentStep < 4 && !isAiMode && (
        <>
          <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent my-8 h-[1px] w-full" />
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="text-neutral-500 hover:text-white transition-colors text-sm font-medium disabled:opacity-50"
            >
              &larr; Back
            </button>
            
            <button
              onClick={currentStep < 3 ? nextStep : form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="relative group/btn bg-white text-black px-6 py-2 rounded-md font-medium text-sm transition-transform active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : currentStep < 3 ? "Continue" : "Launch Store"}
              <BottomGradient />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const BottomGradient = () => (
  <>
    <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
    <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
  </>
);

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div>
);

const ErrorMsg = ({ msg }: { msg?: string }) => (
  <span className="text-xs text-red-500 mt-1">{msg}</span>
);

import { OnboardingWizard } from "@/components/onboarding-wizard";
import { AnimatedBackground } from "@/components/ui/animated-background";

export default function Home() {
  return (
    <main className="dark min-h-screen relative flex items-center justify-center p-4 sm:p-8 overflow-hidden text-slate-50">
      <AnimatedBackground />
      
      <div className="w-full z-10">
        <div className="text-center mb-12 pt-8 relative">
          <motion-stub> 
            {/* Fake stub to represent where we could put initial load animations later */}
          </motion-stub>
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium text-white/80 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            ✨ Next-Gen E-Commerce Builder
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Launch Your{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 animate-pulse">
              Dream Store
            </span>
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto text-lg md:text-xl font-light">
            Create a stunning, fully-functional e-commerce platform in minutes. No coding required. Just your vision.
          </p>
        </div>
        
        <OnboardingWizard />
      </div>
    </main>
  );
}

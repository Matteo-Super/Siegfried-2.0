import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Background } from "./components/ui/Background";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { Hero } from "./components/sections/Hero";
import { Features } from "./components/sections/Features";
import { Simulation } from "./components/sections/Simulation";
import { MediaShowcase } from "./components/sections/MediaShowcase";
import { Pricing } from "./components/sections/Pricing";
import { OpenSource } from "./components/sections/OpenSource";
import { Community } from "./components/sections/Community";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, unlockPremium } = useAuth();
  const [toast, setToast] = useState<string | null>(null);

  // Handle the Stripe Payment Link success redirect (?purchase=success).
  // The lightweight client-side unlock writes premium=true to the user's doc.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("purchase") === "success") {
      if (user) {
        void unlockPremium().then(() => setToast("Zahlung erfolgreich — Premium freigeschaltet! 🎉"));
      } else {
        setToast("Zahlung erfolgreich! Melde dich an, um Premium zu aktivieren.");
      }
      params.delete("purchase");
      const url =
        window.location.pathname + (params.toString() ? `?${params}` : "") + "#pricing";
      window.history.replaceState({}, "", url);
    }
  }, [user, unlockPremium]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(id);
  }, [toast]);

  return (
    <>
      <Background />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Simulation />
        <MediaShowcase />
        <Pricing />
        <OpenSource />
        <Community />
      </main>
      <Footer />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 40, x: "-50%" }}
            className="glass fixed bottom-6 left-1/2 z-[120] flex items-center gap-3 px-5 py-3.5 text-sm font-semibold"
          >
            <i className="fa-solid fa-circle-check text-signal-green" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

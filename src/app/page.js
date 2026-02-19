"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import HeroPage from "@/components/HeroPage";
import Projects from "./Projects";
import { PreLoader_006 } from "@/components/skiper15";
// import PreLoader_006 from "@/components/PreLoader_006"; // adjust path

export default function Home() {
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative h-full w-full">
      <AnimatePresence mode="popLayout">
        {showPreloader && (
          <motion.div
            key="preloader"
            initial={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 1, ease: [0.785, 0.135, 0.15, 0.86] }}
            className="fixed inset-0 z-[999]"
          >
            <PreLoader_006 />
          </motion.div>
        )}
      </AnimatePresence>

      {!showPreloader && (
        <div className="h-full w-full">
          <HeroPage />
          <Projects />
        </div>
      )}
    </main>
  );
}

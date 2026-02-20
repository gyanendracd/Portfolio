"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import React, { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const Skiper15 = () => {
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="h-full w-full">
      <AnimatePresence mode="popLayout">
        {showPreloader && (
          <motion.div
            key="preloader"
            initial={{ y: 0 }}
            exit={{ y: "-100%" }}
            className="h-full w-full"
            transition={{ duration: 1, ease: [0.785, 0.135, 0.15, 0.86] }}
          >
            <PreLoader_006 />
          </motion.div>
        )}
      </AnimatePresence>
      <Main />
    </section>
  );
};

export { Skiper15 };

const Main = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-white font-mono font-medium uppercase text-black/20">
      <p>Get your</p>
      <img src="/svgs/dot-logo.svg" alt="" />
      <p>now</p>
    </div>
  );
};

export const PreLoader_006 = () => {
  const [progress, setProgress] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [showInfo2, setShowInfo2] = useState(false);
  const [showInfo3, setShowInfo3] = useState(false);

  useEffect(() => {
    if (progress >= 100) return;

    const delays = [250, 250, 100, 250, 250, 100, 300, 250, 250, 500];

    const currentStep = Math.floor(progress / 10);

    if (currentStep < delays.length) {
      const timer = setTimeout(() => {
        setProgress((prev) => prev + 10);
      }, delays[currentStep]);

      return () => clearTimeout(timer);
    }
  }, [progress]);

  useEffect(() => {
    if (progress >= 20) {
      setShowInfo(true);
    }
  }, [progress]);

  useEffect(() => {
    if (progress >= 50) {
      setShowInfo2(true);
    }
  }, [progress]);

  useEffect(() => {
    if (progress >= 70) {
      setShowInfo3(true);
    }
  }, [progress]);

  return (
    <div className="z-50 flex h-full w-full items-center justify-center bg-[#F1F1F2]">
      <div className="rounded-2xl bg-white">
        <div className="flex items-center justify-between px-3 py-2">
          <p className="font-geist text-sm font-medium uppercase text-[#121212]/70">
            Loader
          </p>
          <div className="flex items-center justify-center gap-1">
            <div className="size-3 rounded-full bg-[#F1F1F2]" />
            <div className="size-3 rounded-full bg-[#F1F1F2]" />
          </div>
        </div>
        <hr className="opacity-10" />
        <div className="p-4">
          <div className="flex w-full gap-2 rounded-lg bg-[#F1F1F2]/50 p-2">
            {[...Array(10)].map((_, index) => (
              <div
                key={index}
                className={cn(
                  "size-7 rounded-md transition-colors duration-300",
                  progress >= (index + 1) * 10
                    ? "bg-[#121212]/70"
                    : "bg-[#EEEEEF]",
                )}
              />
            ))}
          </div>
          <p className="mt-4 text-right font-medium tracking-tighter text-[#121212]/70">
            {progress}%
          </p>
        </div>
      </div>
      <AnimatePresence>
        {showInfo && (
          <motion.div
            drag
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 1,
              delay: 0.5,
              bounce: 0.4,
              type: "spring",
            }}
            className="absolute bottom-[10%] right-[10%] cursor-grab overflow-hidden rounded-2xl bg-white active:cursor-grabbing"
          >
            <div className="flex items-center justify-between px-3 py-2">
              <p className="font-geist text-sm font-medium uppercase text-[#121212]/70">
                useful info
              </p>
              <div className="flex items-center justify-center gap-1">
                <div className="size-3 rounded-full bg-[#F1F1F2]" />
                <div className="size-3 rounded-full bg-[#F1F1F2]" />
              </div>
            </div>
            <hr className="opacity-10" />
            <div className="max-w-xs p-4 text-sm font-medium text-[#121212]/20">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt
              perferendis eum pariatur dolore, quod ipsum expedita ducimus,
              veritatis atque sit fuga, aspernatur optio sunt repellat.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showInfo2 && (
          <motion.div
            drag
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 1,
              delay: 0.5,
              bounce: 0.4,
              type: "spring",
            }}
            className="absolute bottom-[10%] left-[10%] rotate-12 cursor-grab overflow-hidden bg-white active:cursor-grabbing"
          >
            <div className="font-geist-mono max-w-[10rem] p-4 text-xl font-medium uppercase leading-[1] tracking-tight text-[#121212]/60">
              API, <br /> DATABASE, <br /> great UI/UX <br /> <br />{" "}
              Collection JAN 2026
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showInfo3 && (
          <motion.div
            drag
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 1,
              delay: 0.5,
              bounce: 0.4,
              type: "spring",
            }}
            className="absolute right-[10%] top-[10%] h-40 -rotate-12 cursor-grab overflow-hidden bg-white active:cursor-grabbing"
          >
            <div className="font-geist-mono p-4 text-xl font-medium uppercase leading-[1] tracking-tight text-[#121212]/60">
              with <Heart className="inline fill-current stroke-0" /> from{" "}
              <br />
              Rajasthan, <br />
              India
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

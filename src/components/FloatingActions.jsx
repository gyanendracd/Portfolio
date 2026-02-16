"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineDocumentDownload, HiCheck } from "react-icons/hi";
import { Loader2 } from "lucide-react";

export default function DownloadButton() {
    const [state, setState] = useState("idle");

    const handleDownload = () => {
        if (state !== "idle") return;

        setState("loading");

        setTimeout(() => {
            const link = document.createElement("a");
            link.href =
                "https://docs.google.com/document/d/1khIJiCPeFg3bkDLm0TSIb8CwhZEL8MsgBjK38cCp6j8/export?format=pdf";
            link.download = "Gyanendra-CV.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setState("done");
            setTimeout(() => setState("idle"), 2000);
        }, 1200);
    };

    return (
        <div className="fixed bottom-10 right-10 z-[9999]">
            <motion.button
                onClick={handleDownload}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="
          flex items-center gap-2
          bg-[#404040]/90
          text-white
          px-3 py-2
          rounded-lg
          border border-white/30
          backdrop-blur-md
          shadow-lg
          hover:bg-[#505050]
          transition
          font-mono
          text-xl
        "
            >
                <span>
                    {state === "idle" && "Download"}
                    {state === "loading" && "Downloading"}
                    {state === "done" && "All Set"}
                </span>

                <AnimatePresence mode="wait">
                    {state === "idle" && (
                        <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <HiOutlineDocumentDownload size={22} />
                        </motion.div>
                    )}

                    {state === "loading" && (
                        <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Loader2 size={22} className="animate-spin" />
                        </motion.div>
                    )}

                    {state === "done" && (
                        <motion.div key="c" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <HiCheck size={22} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}

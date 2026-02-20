"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineDocumentDownload,
  HiMail,
} from "react-icons/hi";
import {
  FaLinkedin,
  FaInstagram,
  FaArtstation,
  FaGithubAlt,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Loader2 } from "lucide-react";

export default function FloatingActions() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    if (downloading) return;
    setDownloading(true);

    setTimeout(() => {
      const link = document.createElement("a");
      link.href =
        "https://docs.google.com/document/d/1khIJiCPeFg3bkDLm0TSIb8CwhZEL8MsgBjK38cCp6j8/export?format=pdf";
      link.download = "Gyanendra-CV.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => setDownloading(false), 2000);
    }, 800);
  };

  const ExpandButton = ({ icon, text, onClick, href }) => {
    const isDownload = text?.toLowerCase().includes("download");

    return (
      <motion.a
        initial={isDownload ? "hover" : "rest"}
        animate={isDownload ? "hover" : "rest"}
        whileHover="hover"
        variants={{
          rest: { width: 40 },
          hover: { width: 150 },
        }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        onClick={onClick}
        href={href}
        target={href ? "_blank" : undefined}
        rel={href ? "noopener noreferrer" : undefined}
        className="
          flex items-center overflow-hidden
          h-10
          bg-black/10 text-white
          rounded-sm
          border border-white/10
          shadow-[0_4px_10px_rgba(255,255,255,0.15)]
          hover:scale-[1.03]
          transition-transform
        "
      >
        {/* Icon */}
        <div className="flex items-center justify-center min-w-[40px]">
          {icon}
        </div>

        {/* Text */}
        <motion.span
          variants={{
            rest: { opacity: 0, x: -6 },
            hover: { opacity: 1, x: 0 },
          }}
          transition={{ duration: 0.2, delay: 0.12 }}
          className="whitespace-nowrap pr-4 font-mono text-[13px]"
        >
          {text}
        </motion.span>
      </motion.a>
    );
  };

  return (
    <div className="fixed bottom-8 left-8 z-[9999] flex flex-row gap-3">
      <ExpandButton
        text={downloading ? "Downloading..." : "Download CV"}
        onClick={handleDownload}
        icon={
          downloading ? (
            <Loader2 size={22} className="animate-spin" />
          ) : (
            <HiOutlineDocumentDownload size={22} />
          )
        }
      />

      <ExpandButton
        text="LinkedIn"
        href="https://www.linkedin.com/in/thatsgyan/"
        icon={<FaLinkedin size={22} />}
      />

      <ExpandButton
        text="GitHub"
        href="https://github.com/gyanendracd"
        icon={<FaGithubAlt size={22} />}
      />

      <ExpandButton
        text="ArtStation"
        href="https://www.artstation.com/thatsgyan"
        icon={<FaArtstation size={22} />}
      />

      <ExpandButton
        text="X.com"
        href="https://twitter.com/YOUR_ID"
        icon={<FaXTwitter size={22} />}
      />

      <ExpandButton
        text="Contact"
        href="mailto:your@email.com"
        icon={<HiMail size={22} />}
      />
    </div>
  );
}
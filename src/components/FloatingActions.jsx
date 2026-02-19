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
    FaTwitter,
    FaArtstation,
} from "react-icons/fa";
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
        }, 1000);
    };

    const ExpandButton = ({ icon, text, onClick, href }) => {
        const isDownload = text?.toLowerCase().includes("download");

        return (
            <motion.a
                initial={isDownload ? "hover" : "rest"}
                animate={isDownload ? "hover" : "rest"}
                whileHover="hover"
                variants={{
                    rest: { width: 48 },
                    hover: { width: 170 },
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={onClick}
                href={href}
                target={href ? "_blank" : undefined}
                rel={href ? "noopener noreferrer" : undefined}
                className="flex items-center overflow-hidden h-12 bg-[#404040]/90 text-white rounded-l-md border border-white/10 border-r-[5px]
                       border-r-red-700 shadow-[2px_0_12px_rgba(255,255,255,0.25)] hover:cursor-pointer active:cursor-grabbing"
            >
                {/* Icon */}
                <div className="flex items-center justify-center min-w-[48px]">
                    {icon}
                </div>

                {/* Text */}
                <motion.span
                    variants={{
                        rest: { opacity: 0, x: -10 },
                        hover: { opacity: 1, x: 0 },
                    }}
                    transition={{
                        duration: 0.2,
                        delay: 0.15,
                    }}
                    className="whitespace-nowrap pr-4 font-mono text-sm"
                >
                    {text}
                </motion.span>
            </motion.a>
        );
    };


    return (
        <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end gap-3 w-[170px]">

            <ExpandButton
                text={downloading ? "Downloading..." : "Download CV"}
                onClick={handleDownload}
                icon={
                    downloading ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <HiOutlineDocumentDownload size={20} />
                    )
                }
            />

            <ExpandButton
                text="LinkedIn"
                href="https://linkedin.com/in/YOUR_ID"
                icon={<FaLinkedin size={20} />}
            />

            <ExpandButton
                text="ArtStation"
                href="https://artstation.com/YOUR_ID"
                icon={<FaArtstation size={20} />}
            />

            <ExpandButton
                text="Instagram"
                href="https://instagram.com/YOUR_ID"
                icon={<FaInstagram size={20} />}
            />

            <ExpandButton
                text="Twitter"
                href="https://twitter.com/YOUR_ID"
                icon={<FaTwitter size={20} />}
            />

            <ExpandButton
                text="Contact Me"
                href="mailto:your@email.com"
                icon={<HiMail size={20} />}
            />

        </div>
    );

}

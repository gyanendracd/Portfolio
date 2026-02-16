"use client";

import { useMediaQuery } from "@custom-react-hooks/use-media-query";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";

interface Project {
  id: number;
  label: string;
  year: string;
  image: string;
}

const projects: Project[] = [
  {
    id: 1,
    label: "Velvet ® Dreams Studio",
    year: "2024",
    image: "/images/lummi/imgp3.png",
  },
  {
    id: 2,
    label: "Neon Pulse ® Agency",
    year: "2024",
    image: "/images/lummi/illstration15.png",
  },
  {
    id: 3,
    label: "Midnight Canvas",
    year: "2024",
    image: "/images/lummi/img32.png",
  },
  {
    id: 4,
    label: "Echo Digital Lab",
    year: "2024",
    image: "/images/lummi/img27.png",
  },
  {
    id: 5,
    label: "Skiper Creative ® Co ",
    year: "2023",
    image: "/skiperv1/common/img5.webp",
  },
  {
    id: 6,
    label: "Cosmic Brew Studios",
    year: "2023—2024",
    image: "/images/lummi/illstration12.png",
  },
  {
    id: 7,
    label: "Horizon Typography",
    year: "2024",
    image: "/images/lummi/illstration13.png",
  },
  {
    id: 8,
    label: "Waves & ® Motion",
    year: "2022—2024",
    image: "/skiperv1/common/img8.webp",
  },
  {
    id: 9,
    label: "Stellar Workshop",
    year: "2023",
    image: "/images/lummi/illstration9.png",
  },
  {
    id: 10,
    label: "Prism ® Media House",
    year: "2023",
    image: "/images/lummi/img17.png",
  },
  {
    id: 11,
    label: "Aurora Design Co ™ ",
    year: "2023",
    image: "/images/lummi/illstration5.png",
  },
  {
    id: 12,
    label: "Flux Interactive",
    year: "2023",
    image: "/images/lummi/img12.png",
  },
  {
    id: 13,
    label: "Ember Creative Lab ™",
    year: "2022",
    image: "/images/lummi/illstration3.png",
  },
  {
    id: 14,
    label: "Zenith Brand Studio",
    year: "2024",
    image: "/images/lummi/img15.png",
  },
  {
    id: 15,
    label: "Quantum Visual Arts",
    year: "2022—2023",
    image: "/images/lummi/img21.png",
  },
  {
    id: 16,
    label: "Quantum Visual Arts",
    year: "2022—2023",
    image: "/images/lummi/img8.png",
  },
  {
    id: 17,
    label: "Quantum Visual Arts",
    year: "2022—2023",
    image: "/images/lummi/img1.png",
  },
];

const Skiper35 = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(15);
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <section className="h-full w-full bg-[#121212] text-[#F1F1F1]">
      <div className="overflow-hidden md:h-full">
        <motion.div className="mx-auto flex w-full flex-col md:h-full md:flex-row lg:min-w-[1600px]">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              className="lg:border-r-1 relative h-full w-full cursor-pointer border-0 border-white/30"
              onClick={isMobile ? () => setSelectedIndex(index) : undefined}
              onMouseEnter={
                !isMobile ? () => setSelectedIndex(index) : undefined
              }
              initial={
                isMobile
                  ? { height: "4rem", width: "100%" }
                  : { width: "4rem", height: "100%" }
              }
              animate={
                isMobile
                  ? {
                    height: selectedIndex === index ? "500px" : "4rem",
                    width: "100%",
                  }
                  : { width: selectedIndex === index ? "28rem" : "4rem" }
              }
              transition={{ stiffness: 200, damping: 25, type: "spring" }}
            >
              <motion.div
                className="absolute bottom-0 left-[2vw] flex w-[calc(100vh-2.6vw)] origin-[0_50%] transform justify-between pr-5 text-xl font-medium md:text-[clamp(14px,1.4vw,28px)]
leading-[clamp(18px,2vw,36px)] tracking-[-0.03em] md:-rotate-90 md:text-[2vw]"
                animate={{
                  color:
                    selectedIndex === index
                      ? "#F1F1F1"
                      : "rgba(241, 241, 241, 0.3)",
                }}
                transition={{ duration: 0.3 }}
              >
                <p className="label w-full border-b py-2 md:w-auto md:border-0 md:py-0">
                  {project.label}
                </p>
                <AnimatePresence>
                  {selectedIndex === index && (
                    <motion.p
                      className="year"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {project.year}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 1 }}
                animate={{
                  opacity: selectedIndex === index ? 1 : 0,
                }}
                className="h-[92%] rounded-[0.6vw] object-cover pl-2 pr-[1.3vw] pt-[1.3vw] md:h-[100%] md:pb-[1.3vw] md:pl-[4vw]"
              >
                <motion.img
                  src={project.image}
                  alt={project.label}
                  className="w-full rounded-xl"
                  style={{ height: "100%", objectFit: "cover" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export { Skiper35 };

/**
 * Skiper 35 HoverExpand — React + framer motion
 *
 * License & Usage:
 * - Free to use and modify in both personal and commercial projects.
 * - Attribution to Skiper UI is required when using the free version.
 * - No attribution required with Skiper UI Pro.
 *
 * Feedback and contributions are welcome.
 *
 * Author: @gurvinder-singh02
 * Website: https://gxuri.in
 * Twitter: https://x.com/Gur__vi
 */

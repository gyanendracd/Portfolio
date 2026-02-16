"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type DrawingType = "drawOnHold" | "drawAlways";

interface DrawingCursorEffectProps {
  children?: React.ReactNode;
  strokeColor?: string;
  strokeWidth?: number;
  type: DrawingType;
  followEffect?: boolean;
  customCursor?: boolean;
  className?: string;
}

interface LineSegment {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  timestamp: number;
  opacity?: number;
}

function supportsTouch(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

const DrawingCursorEffect: React.FC<DrawingCursorEffectProps> = ({
  children,
  strokeColor = "#000000",
  strokeWidth = 1,
  type,
  followEffect = false,
  customCursor = false,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lines, setLines] = useState<LineSegment[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  // Motion values for cursor tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Transform for smooth cursor following
  const cursorX = useTransform(mouseX, (value) => value - 8);
  const cursorY = useTransform(mouseY, (value) => value - 8);

  const lastPointRef = useRef<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });

  // Canvas drawing function
  const drawLines = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set line style
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Draw all lines
    lines.forEach((line) => {
      ctx.globalAlpha = line.opacity || 1;
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
    });

    ctx.globalAlpha = 1;
  }, [lines, strokeColor, strokeWidth]);

  // Resize canvas to match container
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  // Animation loop for follow effect
  useEffect(() => {
    if (!followEffect) {
      drawLines();
      return;
    }

    const animate = () => {
      const now = Date.now();

      setLines((prevLines) => {
        const updatedLines = prevLines
          .map((line) => {
            const age = now - line.timestamp;
            const maxAge = 500; // 500ms fade out
            const opacity = Math.max(0, 1 - age / maxAge);
            return { ...line, opacity };
          })
          .filter((line) => (line.opacity || 0) > 0);

        return updatedLines;
      });

      drawLines();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [followEffect, drawLines]);

  // Draw lines when not using follow effect
  useEffect(() => {
    if (!followEffect) {
      drawLines();
    }
  }, [lines, followEffect, drawLines]);

  const addLineSegment = useCallback(
    (x1: number, y1: number, x2: number, y2: number) => {
      const newLine: LineSegment = {
        id: `line-${Date.now()}-${Math.random()}`,
        x1,
        y1,
        x2,
        y2,
        timestamp: Date.now(),
        opacity: 1,
      };

      setLines((prev) => [...prev, newLine]);

      if (followEffect) {
        // Lines will fade out naturally in animation loop
      }
    },
    [followEffect],
  );

  const clearLines = useCallback(() => {
    if (followEffect) {
      // Gradual clear for follow effect - lines will fade naturally
      setLines([]);
    } else {
      // Immediate clear
      setLines([]);
    }
  }, [followEffect]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const currentX = event.clientX - rect.left;
      const currentY = event.clientY - rect.top;

      // Update motion values for cursor tracking
      mouseX.set(currentX);
      mouseY.set(currentY);

      if (!(type === "drawAlways" || (type === "drawOnHold" && isDrawing))) {
        lastPointRef.current = { x: currentX, y: currentY };
        return;
      }

      if (lastPointRef.current.x === null || lastPointRef.current.y === null) {
        lastPointRef.current = { x: currentX, y: currentY };
        return;
      }

      const prevX = lastPointRef.current.x;
      const prevY = lastPointRef.current.y;

      const dx = currentX - prevX;
      const dy = currentY - prevY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Minimum distance threshold to prevent micro-movements
      const minDistance = 1;
      const stepSize = Math.max(strokeWidth * 0.3, 2);

      if (distance < minDistance) {
        return;
      }

      if (distance > stepSize) {
        const numSteps = Math.ceil(distance / stepSize);
        const stepX = dx / numSteps;
        const stepY = dy / numSteps;

        let startX = prevX;
        let startY = prevY;

        for (let i = 1; i <= numSteps; i++) {
          const interX = prevX + i * stepX;
          const interY = prevY + i * stepY;

          addLineSegment(startX, startY, interX, interY);

          startX = interX;
          startY = interY;
        }
      } else {
        addLineSegment(prevX, prevY, currentX, currentY);
      }

      lastPointRef.current = { x: currentX, y: currentY };
    },
    [type, isDrawing, strokeWidth, addLineSegment, mouseX, mouseY],
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (type === "drawOnHold" && event.button === 0) {
        setIsDrawing(true);
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const currentX = event.clientX - rect.left;
          const currentY = event.clientY - rect.top;
          lastPointRef.current = { x: currentX, y: currentY };
        }
        event.preventDefault();
      }
    },
    [type],
  );

  const handleMouseUp = useCallback(() => {
    if (type === "drawOnHold") {
      setIsDrawing(false);
    }
  }, [type]);

  const handleMouseEnter = useCallback(
    (event: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const currentX = event.clientX - rect.left;
        const currentY = event.clientY - rect.top;
        lastPointRef.current = { x: currentX, y: currentY };
        mouseX.set(currentX);
        mouseY.set(currentY);
      }
    },
    [mouseX, mouseY],
  );

  const handleMouseLeave = useCallback(() => {
    lastPointRef.current = { x: null, y: null };
    if (type === "drawOnHold") {
      setIsDrawing(false);
    }
    clearLines();
  }, [type, clearLines]);

  // Setup canvas and resize handling
  useEffect(() => {
    resizeCanvas();

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [resizeCanvas]);

  useEffect(() => {
    if (supportsTouch()) {
      console.log("Drawing cursor effect disabled on touch device.");
      return;
    }

    const handleGlobalMouseUp = () => {
      if (type === "drawOnHold") {
        setIsDrawing(false);
      }
    };

    if (type === "drawOnHold") {
      window.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      if (type === "drawOnHold") {
        window.removeEventListener("mouseup", handleGlobalMouseUp);
      }
    };
  }, [type]);

  if (supportsTouch()) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-stretch justify-between p-8">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <motion.div
        ref={containerRef}
        className="relative h-full w-full"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Canvas for drawing */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 z-10"
        />

        {/* Custom cursor */}
        {customCursor && (
          <motion.div
            className="pointer-events-none absolute z-30"
            style={{
              x: cursorX,
              y: cursorY,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: isDrawing ? 1.2 : 1,
              backgroundColor: isDrawing ? strokeColor : "transparent",
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          >
            <div
              className="h-4 w-4 rounded-full border-2 border-current"
              style={{
                borderColor: strokeColor,
                backgroundColor: isDrawing ? strokeColor : "transparent",
              }}
            />
          </motion.div>
        )}
      </motion.div>

      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-stretch justify-between p-8">
        {children}
      </div>
    </div>
  );
};

const Skiper59 = () => {
  return (
    <div className="h-full w-full bg-[#FC0F49]">
      <div className="absolute left-1/2 top-[40%] grid -translate-x-1/2 content-start justify-items-center gap-6 text-center text-white">
        <span className="relative max-w-[12ch] text-xs uppercase leading-tight opacity-40 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:from-transparent after:to-white after:content-['']">
          Move the cursor to see the effect
        </span>
      </div>
      <DrawingCursorEffect
        type="drawAlways" // Draw always over the image (drawOnHold, drawAlways )
        strokeColor="#fff"
        strokeWidth={2} // Medium lines
        followEffect // Add follow effect
        className="h-full w-full"
      ></DrawingCursorEffect>
    </div>
  );
};

export { Skiper59 };

{
  /* <DrawingCursorEffect
      type="drawAlways" // Draw always over the image (drawOnHold, drawAlways )
      bgImageSrc={imageUrl} // Add background image
      strokeColor="#ffffff" // Red lines for better visibility
      strokeWidth={2} // Medium lines
      followEffect={true} // Add follow effect
    >
      <div className="p-8 text-center text-white">
        <h1 className="text-4xl font-bold">Auto-Drawing Trail on Image</h1>
        <p className="mt-2">Move cursor to see the effect.</p>
      </div>
    </DrawingCursorEffect> */
}

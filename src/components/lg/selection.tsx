"use client";

import React, { useRef, useState, useEffect } from "react";

import { ChevronsUpDown } from "lucide-react";

import {
  MorphingPopover,
  MorphingPopoverContent,
  MorphingPopoverTrigger,
} from "@/components/mp/morphing-popover";

import styles from "./selection.module.scss";

interface SelectionProps {
  children?: React.ReactNode;
  value: string;
}

export default function Selection({ children, value }: SelectionProps) {
  const [isTextOverflow, setIsTextOverflow] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const textWidth = textRef.current.scrollWidth;

        setIsTextOverflow(textWidth > containerWidth);
      }
    };

    checkOverflow();

    window.addEventListener("resize", checkOverflow);

    return () => window.removeEventListener("resize", checkOverflow);
  }, [value]);

  return (
    <MorphingPopover
      variants={{
        initial: { opacity: 0, borderRadius: "100%" },
        animate: { opacity: 1, borderRadius: "28px" },
        exit: { opacity: 0, borderRadius: "100%" },
      }}
      transition={{
        type: "spring",
        bounce: 0.1,
        duration: 0.4,
        opacity: { duration: 0.2 },
      }}
    >
      <MorphingPopoverTrigger asChild>
        <div className={styles.selectionBox}>
          <div
            ref={containerRef}
            className={`${styles.marqueeWindow} ${isTextOverflow ? styles.hasOverflow : ""}`}
          >
            <span
              ref={textRef}
              className={
                isTextOverflow ? styles.marqueeContent : styles.staticContent
              }
            >
              {value}
            </span>
          </div>

          <ChevronsUpDown className={styles.icon} />
        </div>
      </MorphingPopoverTrigger>

      <MorphingPopoverContent className={styles.settingsPage}>
        <div>da</div>
      </MorphingPopoverContent>
    </MorphingPopover>
  );
}

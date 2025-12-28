"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  createContext,
  useContext,
} from "react";

import { motion } from "motion/react";

import clsx from "clsx";

import { ChevronsUpDown } from "lucide-react";

import {
  MorphingPopover,
  MorphingPopoverContent,
  MorphingPopoverTrigger,
} from "@/components/mp/morphing-popover";
import { Magnetic } from "@/components/mp/magnetic";

import styles from "./selection.module.scss";

interface SelectionContextType {
  selectedValue: string;
  onSelect: (value: string) => void;
  setIsOpen: (isOpen: boolean) => void;
}

const SelectionContext = createContext<SelectionContextType | null>(null);

interface SelectionProps {
  children: React.ReactNode;
  value: string;
  onSelect?: (value: string) => void;
  onOpenChange?: (isOpen: boolean) => void;
  className?: string;
}

interface SelectionItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

export default function Selection({
  children,
  value,
  onSelect,
  onOpenChange,
}: SelectionProps) {
  const [isTextOverflow, setIsTextOverflow] = useState<boolean>(false);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && measureRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const textWidth = measureRef.current.scrollWidth;

        setIsTextOverflow(textWidth > containerWidth);
      }
    };

    checkOverflow();

    window.addEventListener("resize", checkOverflow);

    return () => window.removeEventListener("resize", checkOverflow);
  }, [value]);

  return (
    <SelectionContext.Provider
      value={{
        selectedValue: value,
        onSelect: (value) => {
          onSelect?.(value);
          setIsOpen(false);
          onOpenChange?.(false);
        },
        setIsOpen,
      }}
    >
      <MorphingPopover
        variants={{
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        }}
        transition={{
          type: "spring",
          bounce: 0.1,
          duration: 0.4,
          opacity: { duration: 0.2 },
        }}
        onOpenChange={(isOpen) => {
          setIsOpen(isOpen);
          onOpenChange?.(isOpen);
        }}
        open={isOpen}
      >
        <MorphingPopoverTrigger asChild>
          <div className={styles.selectionBox}>
            <div
              ref={containerRef}
              className={clsx(
                styles.marqueeWindow,
                isTextOverflow && styles.hasOverflow
              )}
            >
              <span
                ref={measureRef}
                style={{
                  position: "absolute",
                  visibility: "hidden",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}
                aria-hidden={true}
              >
                {value}
              </span>

              <motion.span
                ref={textRef}
                className={
                  isTextOverflow ? styles.marqueeContent : styles.staticContent
                }
                layoutId={`selection-item-${value}`}
                layout={"position"}
              >
                {value}
              </motion.span>
            </div>

            <motion.span layout={"position"}>
              <ChevronsUpDown className={styles.icon} />
            </motion.span>
          </div>
        </MorphingPopoverTrigger>

        <MorphingPopoverContent
          className={styles.selectionPage}
          portal={true}
          anchor={"top-left"}
          strategy="fixed"
        >
          <Magnetic
            intensity={0.1}
            springOptions={{ bounce: 0.1, stiffness: 120 }}
            actionArea="global"
            range={125}
            className={styles.selectionPageMag}
          >
            {children}
          </Magnetic>
        </MorphingPopoverContent>
      </MorphingPopover>
    </SelectionContext.Provider>
  );
}

function SelectionItem({ children, value, className }: SelectionItemProps) {
  const context = useContext(SelectionContext);

  if (!context) {
    throw new Error("Selection.Item must be used within a Selection component");
  }

  return (
    <div
      className={clsx(styles.selectionItem, className)}
      onClick={(e) => {
        e.stopPropagation();

        if (context.selectedValue === value) return;

        context.onSelect(value);
      }}
    >
      <motion.span
        className={clsx(
          styles.itemText,
          context.selectedValue === value && styles.itemTextSelected
        )}
        layoutId={`selection-item-${value}`}
        layout={"position"}
      >
        {children}
      </motion.span>
    </div>
  );
}

Selection.Item = SelectionItem;

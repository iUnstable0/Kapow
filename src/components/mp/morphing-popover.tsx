"use client";

import { createPortal } from "react-dom";

import {
  useState,
  useId,
  useRef,
  useEffect,
  useLayoutEffect,
  createContext,
  useContext,
  isValidElement,
} from "react";

import {
  AnimatePresence,
  MotionConfig,
  motion,
  Transition,
  Variants,
} from "motion/react";

import useClickOutside from "./useClickOutside";
import { cn } from "@/lib/utils";

const TRANSITION = {
  type: "spring",
  bounce: 0.1,
  duration: 0.4,
};

type MorphingPopoverContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  uniqueId: string;
  variants?: Variants;
  triggerRef: React.RefObject<HTMLElement>;
};

const MorphingPopoverContext =
  createContext<MorphingPopoverContextValue | null>(null);

function usePopoverLogic({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const uniqueId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);

  const isOpen = controlledOpen ?? uncontrolledOpen;

  const open = () => {
    if (controlledOpen === undefined) setUncontrolledOpen(true);

    onOpenChange?.(true);
  };

  const close = () => {
    if (controlledOpen === undefined) setUncontrolledOpen(false);

    onOpenChange?.(false);
  };

  return { isOpen, open, close, uniqueId };
}

export type MorphingPopoverProps = {
  children: React.ReactNode;
  transition?: Transition;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variants?: Variants;
  className?: string;
} & React.ComponentProps<"div">;

function MorphingPopover({
  children,
  transition = TRANSITION,
  defaultOpen,
  open,
  onOpenChange,
  variants,
  className,
  ...props
}: MorphingPopoverProps) {
  const popoverLogic = usePopoverLogic({ defaultOpen, open, onOpenChange });
  const triggerRef = useRef<HTMLElement>(null);

  return (
    <MorphingPopoverContext.Provider
      value={{ ...popoverLogic, variants, triggerRef }}
    >
      <MotionConfig transition={transition}>
        <div
          className={cn("relative flex items-center justify-center", className)}
          key={popoverLogic.uniqueId}
          {...props}
        >
          {children}
        </div>
      </MotionConfig>
    </MorphingPopoverContext.Provider>
  );
}

export type MorphingPopoverTriggerProps = {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
} & React.ComponentProps<typeof motion.button>;

function MorphingPopoverTrigger({
  children,
  className,
  asChild = false,
  ...props
}: MorphingPopoverTriggerProps) {
  const context = useContext(MorphingPopoverContext);

  if (!context)
    throw new Error(
      "MorphingPopoverTrigger must be used within MorphingPopover",
    );

  if (asChild && isValidElement(children)) {
    const MotionComponent = motion.create(
      children.type as React.ForwardRefExoticComponent<any>,
    );

    const childProps = children.props as Record<string, unknown>;

    return (
      <MotionComponent
        {...childProps}
        ref={context.triggerRef}
        onClick={context.open}
        layoutId={`popover-trigger-${context.uniqueId}`}
        className={childProps.className}
        key={context.uniqueId}
        aria-expanded={context.isOpen}
        aria-controls={`popover-content-${context.uniqueId}`}
      />
    );
  }

  return (
    <motion.div
      key={context.uniqueId}
      layoutId={`popover-trigger-${context.uniqueId}`}
      onClick={context.open}
    >
      <motion.button
        {...props}
        ref={context.triggerRef as any}
        layoutId={`popover-label-${context.uniqueId}`}
        key={context.uniqueId}
        className={className}
        aria-expanded={context.isOpen}
        aria-controls={`popover-content-${context.uniqueId}`}
      >
        {children}
      </motion.button>
    </motion.div>
  );
}

export type PopoverAnchor =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "left-top"
  | "left-center"
  | "left-bottom"
  | "right-top"
  | "right-center"
  | "right-bottom";

export type MorphingPopoverContentProps = {
  children: React.ReactNode;
  className?: string;
  portal?: boolean;
  anchor?: PopoverAnchor;
  offset?: number;
  dismissOnClickOutside?: boolean;
  strategy?: "absolute" | "fixed";
  manualPositioning?: boolean;
} & React.ComponentProps<typeof motion.div>;

function MorphingPopoverContent({
  children,
  className,
  portal = false,
  anchor = "bottom-left",
  offset = 12,
  dismissOnClickOutside = true,
  strategy = "absolute",
  manualPositioning = false,
  ...props
}: MorphingPopoverContentProps) {
  const context = useContext(MorphingPopoverContext);

  if (!context)
    throw new Error(
      "MorphingPopoverContent must be used within MorphingPopover",
    );

  const ref = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
  });

  useClickOutside(ref, () => {
    if (dismissOnClickOutside) {
      context.close();
    }
  });

  useEffect(() => {
    if (!context.isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") context.close();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [context.isOpen, context.close]);

  useLayoutEffect(() => {
    if (context.isOpen && portal && context.triggerRef.current && ref.current) {
      const updatePosition = () => {
        const triggerRect = context.triggerRef.current?.getBoundingClientRect();
        const contentRect = ref.current?.getBoundingClientRect();

        if (triggerRect && contentRect) {
          let top = 0;
          let left = 0;

          if (anchor.startsWith("bottom")) {
            top = triggerRect.bottom + offset;
          } else if (anchor.startsWith("top")) {
            top = triggerRect.top - contentRect.height - offset;
          } else if (anchor.startsWith("left") || anchor.startsWith("right")) {
            if (anchor.includes("center")) {
              top =
                triggerRect.top +
                triggerRect.height / 2 -
                contentRect.height / 2;
            } else if (anchor.includes("top")) {
              top = triggerRect.top;
            } else if (anchor.includes("bottom")) {
              top = triggerRect.bottom - contentRect.height;
            }
          }

          if (anchor.startsWith("right")) {
            left = triggerRect.right + offset;
          } else if (anchor.startsWith("left")) {
            left = triggerRect.left - contentRect.width - offset;
          } else if (anchor.startsWith("top") || anchor.startsWith("bottom")) {
            if (anchor.includes("center")) {
              left =
                triggerRect.left +
                triggerRect.width / 2 -
                contentRect.width / 2;
            } else if (anchor.includes("left")) {
              left = triggerRect.left;
            } else if (anchor.includes("right")) {
              left = triggerRect.right - contentRect.width;
            }
          }

          const scrollY = strategy === "absolute" ? window.scrollY : 0;
          const scrollX = strategy === "absolute" ? window.scrollX : 0;

          setCoords({
            top: top + scrollY,
            left: left + scrollX,
          });
        }
      };

      updatePosition();

      window.addEventListener("resize", updatePosition);

      if (strategy === "absolute") {
        window.addEventListener("scroll", updatePosition);
      }

      return () => {
        window.removeEventListener("resize", updatePosition);

        if (strategy === "absolute") {
          window.removeEventListener("scroll", updatePosition);
        }
      };
    }
  }, [context.isOpen, portal, anchor, offset, strategy, context.triggerRef]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const style = manualPositioning
    ? { ...props.style }
    : {
        ...(portal ? { top: coords.top, left: coords.left } : {}),
        ...props.style,
      };

  const content = (
    <AnimatePresence>
      {context.isOpen && (
        <motion.div
          {...props}
          ref={ref}
          layoutId={`popover-trigger-${context.uniqueId}`}
          key={context.uniqueId}
          id={`popover-content-${context.uniqueId}`}
          role="dialog"
          aria-modal="true"
          className={cn(
            portal ? strategy : "absolute",
            "z-[9999] overflow-hidden rounded-md border border-zinc-950/10 bg-white p-2 text-zinc-950 shadow-md dark:border-zinc-50/10 dark:bg-zinc-700 dark:text-zinc-50",
            className,
          )}
          style={style}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={context.variants}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (portal) {
    if (!mounted) return null;
    return createPortal(content, document.body);
  }

  return content;
}

export { MorphingPopover, MorphingPopoverTrigger, MorphingPopoverContent };

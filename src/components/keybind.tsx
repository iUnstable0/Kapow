import React, { useEffect, useState } from "react";
// import useSound from "use-sound";

import clsx from "clsx";

import {
  ArrowBigUp,
  CornerDownLeft,
  Delete,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import styles from "./keybind.module.scss";

import { Magnetic } from "./mp/magnetic";
import Spinner from "./spinner";

import { TextMorph } from "./mp/text-morph";

const letters = "abcdefghijklmnopqrstuvwxyz.";

export enum T_Keybind {
  shift = "shift",
  enter = "enter",
  escape = "escape",
  backspace = "backspace",
  m = "m",
  p = "p",
  e = "e",
  r = "r",
  s = "s",
  period = ".",
  tab = "tab",
  right_arrow = "arrowright",
  left_arrow = "arrowleft",
}

export const KeybindButton = ({
  keybinds,
  onPress,
  textClassName,
  disabled,
  children,
  icon,
  iconClassName,
  loading,
  loadingText,
  magnetic = true,
  className,
  preload = true,
  loadingTextEnabled = true,
  reversed = false,
}: {
  keybinds: T_Keybind[];
  onPress?: () => void;
  textClassName?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  iconClassName?: string;
  loading?: boolean;
  loadingText?: string;
  magnetic?: boolean;
  className?: string;
  preload?: boolean;
  loadingTextEnabled?: boolean;
  reversed?: boolean;
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 20,
        opacity: {
          duration: 0.2,
          ease: "easeInOut",
        },
      }}
    >
      <Magnetic
        intensity={0.1}
        springOptions={{ bounce: 0.1 }}
        actionArea="global"
        range={disabled ? 0 : magnetic ? 75 : 0}
        className={className}
      >
        <AnimatePresence>
          <motion.button
            className={clsx(
              styles.keybindButton,
              reversed && styles.keybindButton_reversed,
            )}
            layout
            onClick={() => {
              if (!disabled && !loading) {
                onPress?.();
              }
            }}
            onMouseDown={(e) => e.preventDefault()}
            disabled={disabled}
            tabIndex={-1}
          >
            <AnimatePresence mode="popLayout">
              {!loadingText && icon && (
                <motion.div
                  className={clsx(styles.keybindButtonIcon, iconClassName)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {icon}
                </motion.div>
              )}

              {loadingText && !loading && icon && (
                <motion.div
                  className={clsx(styles.keybindButtonIcon, iconClassName)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {icon}
                </motion.div>
              )}
            </AnimatePresence>

            {loadingText && typeof loading === "boolean" && (
              <Spinner
                id={`keybind-${keybinds.join("-")}`}
                loading={loading}
                size={24}
                preload={!icon && preload}
              />
            )}

            <AnimatePresence>
              <motion.div
                className={clsx(styles.keybindButtonText, textClassName)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key={`keybind_${keybinds.join("_")}_text`}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 20,
                  opacity: {
                    duration: 0.2,
                    ease: "easeInOut",
                  },
                }}
                style={{
                  // if loading and preload is false then set margin left to 32px
                  // ...(loading && !preload ? { paddingLeft: "32px" } : {}),
                  width: "auto",
                }}
                layout
              >
                {/* Temp fix sameline */}
                {loadingTextEnabled ? (
                  <TextMorph
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {`${
                      (loading &&
                        loadingText &&
                        loadingTextEnabled &&
                        loadingText) ||
                      ((!loading || !loadingTextEnabled) && children)
                    }`}
                  </TextMorph>
                ) : (
                  children
                )}

                {/* {children} */}
              </motion.div>

              {keybinds.length > 0 && (
                <Keybind
                  keybinds={keybinds}
                  onPress={onPress}
                  disabled={disabled}
                  loading={loading}
                  loadingText={loadingText}
                  magnetic={magnetic}
                />
              )}
            </AnimatePresence>
          </motion.button>
        </AnimatePresence>
      </Magnetic>
    </motion.div>
  );
};

export default function Keybind({
  keybinds,
  className,
  parentClass,
  onPress,
  disabled,
  loadingText,
  loading,
  magnetic = true,
}: {
  keybinds: T_Keybind[];
  className?: string;
  parentClass?: string;
  onPress?: () => void;
  disabled?: boolean;
  loadingText?: string;
  loading?: boolean;
  magnetic?: boolean;
}) {
  const [heldKeys, setHeldKeys] = useState<Set<string>>(new Set());
  const [animatedKeys, setAnimatedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const addToAnimatedKeys = (key: string) => {
      const keyeventId = `(${keybinds.join(",")}) ++ ${key}`;

      console.log(keyeventId, "added to animated keys");

      setAnimatedKeys((prev) => new Set(prev).add(key));
    };

    const removeFromAnimatedKeys = (key: string) => {
      const keyeventId = `(${keybinds.join(",")}) -- ${key}`;

      setTimeout(() => {
        if (
          onPress &&
          keybinds.every((key) => heldKeys.has(key)) &&
          keybinds[keybinds.length - 1] === key
        ) {
          if (heldKeys.size === keybinds.length) {
            if (!disabled && !loading) {
              console.log(keyeventId, "keybind activated");
              onPress();
            }
          } else {
            console.log(
              keyeventId,
              " | unknown key pressed with keybind",
              Array.from(heldKeys).join(","),
              " | not activating!",
            );
          }
        }

        console.log(keyeventId, "removed from animated keys");

        setAnimatedKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }, 200);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // e.preventDefault();
      // e.stopPropagation();

      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "BUTTON" ||
        target.isContentEditable
      ) {
        if (e.key.toLowerCase() !== "escape") {
          return;
        }
      }

      if (disabled) return;

      const key = e.key.toLowerCase();

      if (e.metaKey) {
        return;
      }

      if (e.ctrlKey) {
        return;
      }

      if (e.repeat) {
        return;
      }

      const keyeventId = `(${keybinds.join(",")}) + ${key}`;

      console.log(keyeventId, "pressed");

      setHeldKeys((prev) => new Set(prev).add(key));

      if (keybinds.includes(key as T_Keybind)) {
        addToAnimatedKeys(key);
      }
      // }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (e.metaKey) {
        return;
      }

      if (e.ctrlKey) {
        return;
      }

      if (e.repeat) {
        return;
      }

      const keyeventId = `(${keybinds.join(",")}) - ${key}`;

      console.log(keyeventId, "released");

      setHeldKeys((prev) => {
        const next = new Set(prev);

        next.delete(key);

        return next;
      });

      if (animatedKeys.has(key) && keybinds.includes(key as T_Keybind)) {
        removeFromAnimatedKeys(key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heldKeys, animatedKeys, disabled]);

  return (
    <motion.div
      key={`keybind_${keybinds.join("_")}_magnet`}
      className={styles.keybindContainerMagnet}
      layout
    >
      <Magnetic
        intensity={0.1}
        springOptions={{ bounce: 0.1 }}
        actionArea="global"
        range={disabled ? 0 : magnetic ? 75 : 0}
        className={styles.keybindContainerMagnet}
      >
        {keybinds.map((keybind, index) => (
          <div
            className={clsx(
              styles.keybindContainer,
              loadingText && loading && styles.keybindContainer_loading,
              animatedKeys.has(keybind) && styles.keybindContainer_active,
              animatedKeys.size === keybinds.length &&
                Array.from(animatedKeys).filter((key) =>
                  keybinds.includes(key as T_Keybind),
                ).length === keybinds.length &&
                styles.keybindContainer_activeall,
            )}
            key={`keybind_${keybind}_${index}`}
          >
            {keybind === T_Keybind.shift && (
              <ArrowBigUp className={clsx(styles.keybindIcon, className)} />
            )}
            {keybind === T_Keybind.enter && (
              <CornerDownLeft className={clsx(styles.keybindIcon, className)} />
            )}
            {keybind === T_Keybind.escape && (
              // <CircleArrowOutUpLeft
              //   className={clsx(styles.keybindIcon, className)}
              // />
              <span className={clsx(styles.keybindText, className)}>esc</span>
            )}
            {keybind === T_Keybind.tab && (
              <span className={clsx(styles.keybindText, className)}>esc</span>
            )}
            {keybind === T_Keybind.backspace && (
              <Delete className={clsx(styles.keybindIcon, className)} />
            )}
            {keybind === T_Keybind.right_arrow && (
              <span className={clsx(styles.keybindText, className)}>
                <ArrowRight className={clsx(styles.keybindIcon, className)} />
              </span>
            )}
            {keybind === T_Keybind.left_arrow && (
              <span className={clsx(styles.keybindText, className)}>
                <ArrowLeft className={clsx(styles.keybindIcon, className)} />
              </span>
            )}
            {letters.includes(keybind) && (
              <span className={clsx(styles.keybindText, className)}>
                {keybind.toString()}
              </span>
            )}
          </div>
        ))}
      </Magnetic>
    </motion.div>
  );
}

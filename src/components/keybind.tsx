import React, { useEffect, useState } from "react";
import clsx from "clsx";

import {
  ArrowBigUp,
  CornerDownLeft,
  Delete,
  ArrowRight,
  ArrowLeft,
  Space,
} from "lucide-react";

import stylesDynamic from "./keybind-dyn.module.scss";
import stylesLight from "./keybind-light.module.scss";
import stylesDark from "./keybind-dark.module.scss";

import { Magnetic } from "./mp/magnetic";
import Spinner from "./spinner";
import { AnimatePresence, motion } from "motion/react";
import { TextMorph } from "./mp/text-morph";

const letters = "abcdefghijklmnopqrstuvwxyz.1234567890";

export enum T_Keybind {
  shift = "shift",
  enter = "enter",
  escape = "escape",
  backspace = "backspace",

  space = " ",

  q = "q",
  w = "w",
  e = "e",
  r = "r",
  t = "t",
  y = "y",
  u = "u",
  i = "i",
  o = "o",
  p = "p",
  a = "a",
  s = "s",
  d = "d",
  f = "f",
  g = "g",
  h = "h",
  j = "j",
  k = "k",
  l = "l",
  z = "z",
  x = "x",
  c = "c",
  v = "v",
  b = "b",
  n = "n",
  m = "m",

  one = "1",
  two = "2",
  three = "3",
  four = "4",
  five = "5",
  six = "6",
  seven = "7",
  eight = "8",
  nine = "9",
  zero = "0",

  period = ".",
  tab = "tab",
  right_arrow = "arrowright",
  left_arrow = "arrowleft",
}

export const KeybindButton = ({
  keybinds,
  dangerous,
  onPress,
  textClassName,
  disabled,
  forceTheme,
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
  dangerous?: boolean;
  onPress?: () => void;
  textClassName?: string;
  disabled?: boolean;
  forceTheme?: "light" | "dark";
  children?: React.ReactNode;
  icon?: React.ReactNode;
  iconClassName?: string;
  loading?: boolean;
  loadingText?: string;
  magnetic?: boolean;
  className?: string;
  // loadingTheme?: "light" | "dark" | "dangerous";
  preload?: boolean;
  loadingTextEnabled?: boolean;
  reversed?: boolean;
}) => {
  let styles;

  if (forceTheme === "light") {
    styles = stylesLight;
  } else if (forceTheme === "dark") {
    styles = stylesDark;
  } else {
    styles = stylesDynamic;
  }

  return (
    <motion.div
      key={`keybindbutton_${keybinds.join("_")}_${forceTheme}`}
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
      layout
      // style={{
      //   background: "red",
      // }}
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
              dangerous && styles.keybindButtonDangerous,
              reversed && styles.keybindButtonReversed,
              // dangerous && loading === true && styles.keybindButtonDangerous,
            )}
            onClick={() => {
              if (!disabled && !loading) {
                onPress?.();
              }
            }}
            // whileHover={{ scale: disabled ? 1 : 1.1 }}
            // whileTap={{
            //   scale: disabled ? 1 : 1.05,
            // }}
            // transition={{
            //   type: "spring",
            //   stiffness: 200,
            //   damping: 20,
            //   opacity: {
            //     duration: 0.2,
            //     ease: "easeInOut",
            //   },
            // }}
            onMouseDown={(e) => e.preventDefault()}
            disabled={disabled}
            tabIndex={-1}
            // THIS WAS THE CULPRIT
            // layout
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
                // id={`keybind-${keybinds.join("-")}-${forceTheme}`}
                loading={loading}
                size={24}
                forceTheme={forceTheme}
                preload={!icon && preload}
                dangerous={dangerous}
              />
            )}

            <motion.div
              key={`keybind_${keybinds.join("_")}_${forceTheme}_text`}
              className={clsx(styles.keybindButtonText, textClassName)}
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

            <AnimatePresence>
              {keybinds.length > 0 && (
                <Keybind
                  keybinds={keybinds}
                  dangerous={dangerous}
                  onPress={onPress}
                  disabled={disabled}
                  loading={loading}
                  loadingText={loadingText}
                  forceTheme={forceTheme}
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
  dangerous,
  onPress,
  disabled,
  forceTheme,
  loadingText,
  loading,
  magnetic = true,
}: {
  keybinds: T_Keybind[];
  className?: string;
  parentClass?: string;
  dangerous?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  forceTheme?: "light" | "dark";
  loadingText?: string;
  loading?: boolean;
  magnetic?: boolean;
}) {
  let styles = stylesDynamic;

  if (forceTheme === "light") {
    styles = stylesLight;
  } else if (forceTheme === "dark") {
    styles = stylesDark;
  }

  // Set of currently held keys
  const [heldKeys, setHeldKeys] = useState<Set<string>>(new Set());
  const [animatedKeys, setAnimatedKeys] = useState<Set<string>>(new Set());

  // useEffect(() => {
  //   setTimeout(() => {
  //     setAnimatedKeys(new Set(heldKeys));
  //   }, 200);
  // }, [heldKeys]);

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

      // check if key is in keybinds (keybinds type is T_Keybind[])
      // if (keybinds.includes(key as T_Keybind)) {
      // If it alr contain key then abort!

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
      key={`keybind_${keybinds.join("_")}_${forceTheme}_magnet`}
      className={clsx(styles.keybindContainerMagnet, parentClass)}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 20,
        opacity: {
          duration: 0.2,
          ease: "easeInOut",
        },
      }}
      layout
    >
      <Magnetic
        intensity={0.1}
        springOptions={{ bounce: 0.1 }}
        actionArea="global"
        range={disabled ? 0 : magnetic ? 75 : 0}
        className={styles.keybindContainerMagnet}
        data-theme={forceTheme}
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
            {keybind === T_Keybind.space && (
              <span className={clsx(styles.keybindText, className)}>
                <Space className={clsx(styles.keybindIcon, className)} />
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

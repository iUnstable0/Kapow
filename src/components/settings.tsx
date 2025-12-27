"use client";

import React, { useState, createContext, useContext, useEffect } from "react";

import { Cog } from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";

import { Magnetic } from "./mp/magnetic";

import {
  MorphingPopover,
  MorphingPopoverContent,
  MorphingPopoverTrigger,
} from "./mp/morphing-popover";

import Selection from "./selection";

import styles from "./settings.module.scss";

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 15,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(9px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(12px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "#1890ff",
        ...theme.applyStyles("dark", {
          backgroundColor: "#177ddc",
        }),
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(["width"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: "rgba(0,0,0,.25)",
    boxSizing: "border-box",
    ...theme.applyStyles("dark", {
      backgroundColor: "rgba(255,255,255,.35)",
    }),
  },
}));

interface T_SettingsContext {
  trollModeEnabled: boolean;
  musicEnabled: boolean;
}

const SettingsContext = createContext<T_SettingsContext | null>(null);

function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [trollModeEnabledState, setTrollModeEnabled] = useState<boolean>(false);
  const [musicEnabledState, setMusicEnabled] = useState<boolean>(false);

  const [selectedMusicTrack, setSelectedMusicTrack] = useState<string>("lofi");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const trollMode = localStorage.getItem("trollMode");
    const music = localStorage.getItem("music");

    if (trollMode === null) {
      localStorage.setItem("trollMode", "true");
    }

    if (music === null) {
      localStorage.setItem("music", "true");
    }

    setMounted(true);

    setTrollModeEnabled(localStorage.getItem("trollMode") === "true");
    setMusicEnabled(localStorage.getItem("music") === "true");
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        trollModeEnabled: trollModeEnabledState,
        musicEnabled: musicEnabledState,
      }}
    >
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
          <div className={styles.settings}>
            <Magnetic
              intensity={0.1}
              springOptions={{ bounce: 0.1, stiffness: 120 }}
              actionArea="global"
              range={125}
              // range={disabled ? 0 : magnetic ? 75 : 0}
              // className={className}// action={() => {
              //   alert("Settings clicked!");
              // }}
              className={styles.settingsMagnet}
            >
              <motion.span layoutId={"icon-settings"} layout={"position"}>
                <Cog className={styles.icon} />
              </motion.span>
            </Magnetic>
          </div>
        </MorphingPopoverTrigger>

        <MorphingPopoverContent className={styles.settingsPage}>
          <Magnetic
            intensity={0.1}
            springOptions={{ bounce: 0.1, stiffness: 120 }}
            actionArea="global"
            range={125}
            // range={disabled ? 0 : magnetic ? 75 : 0}
            // className={className}// action={() => {
            //   alert("Settings clicked!");
            // }}
            className={styles.settingsPageMag}
          >
            <motion.div className={styles.settingsTitle} layout>
              <motion.span layoutId={"icon-settings"} layout={"position"}>
                <Cog className={styles.icon} />
              </motion.span>

              <span>Settings</span>
            </motion.div>

            <motion.div className={styles.section} layout>
              Troll mode
              <AntSwitch
                checked={trollModeEnabledState}
                onChange={() => {
                  const newState = !trollModeEnabledState;

                  localStorage.setItem("trollMode", newState.toString());
                  setTrollModeEnabled(newState);
                }}
              />
            </motion.div>

            <motion.div className={styles.section} layout>
              Music
              <AntSwitch
                checked={musicEnabledState}
                onChange={() => {
                  const newState = !musicEnabledState;

                  localStorage.setItem("music", newState.toString());
                  setMusicEnabled(newState);
                }}
              />
            </motion.div>

            <AnimatePresence mode={"popLayout"}>
              {musicEnabledState && (
                <motion.div
                  className={styles.section}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  transition={{
                    type: "spring",
                    bounce: 0.1,
                    duration: 0.5,
                  }}
                >
                  <Selection value={selectedMusicTrack}></Selection>
                </motion.div>
              )}
            </AnimatePresence>
          </Magnetic>
        </MorphingPopoverContent>
      </MorphingPopover>

      {children}
    </SettingsContext.Provider>
  );
}

export default SettingsProvider;

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error(
      "useSettings must be used within a SettingsContext provider",
    );
  }

  return context;
}

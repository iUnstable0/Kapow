"use client";

import React, { useState } from "react";

import clsx from "clsx";

import { Cog } from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";

import { PlaylistEnum, type T_Playlist } from "@/types";

import { useSettings } from "@/components/context/settings";

import { Magnetic } from "@/components/mp/magnetic";

import {
  MorphingPopover,
  MorphingPopoverContent,
  MorphingPopoverTrigger,
} from "@/components/mp/morphing-popover";

import Selection from "@/components/lg/selection";

import styles from "./context/settings.module.scss";

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

export default function SettingsWidget() {
  const {
    trollModeEnabled,
    setTrollModeEnabled,
    musicEnabled,
    setMusicEnabled,
    selectedPlaylist,
    setSelectedPlaylist,
  } = useSettings();

  const [selectionOpen, setSelectionOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

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
      onOpenChange={(isOpen) => setSettingsOpen(isOpen)}
    >
      <MorphingPopoverTrigger asChild>
        <div className={styles.settings}>
          <Magnetic
            intensity={0.1}
            springOptions={{ bounce: 0.1, stiffness: 120 }}
            actionArea="global"
            range={125}
            className={clsx(
              styles.settingsMagnet,
              !settingsOpen && styles.settingsMagnetClosed,
            )}
          >
            <motion.span layoutId={"icon-settings"} layout={"position"}>
              <Cog className={styles.icon} />
            </motion.span>
          </Magnetic>
        </div>
      </MorphingPopoverTrigger>

      <MorphingPopoverContent
        className={styles.settingsPage}
        dismissOnClickOutside={!selectionOpen}
      >
        <Magnetic
          intensity={0.1}
          springOptions={{ bounce: 0.1, stiffness: 120 }}
          actionArea="global"
          range={125}
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
              checked={trollModeEnabled}
              onChange={() => setTrollModeEnabled(!trollModeEnabled)}
            />
          </motion.div>

          <motion.div className={styles.section} layout>
            Music
            <AntSwitch
              checked={musicEnabled}
              onChange={() => setMusicEnabled(!musicEnabled)}
            />
          </motion.div>

          <AnimatePresence mode={"popLayout"}>
            {musicEnabled && (
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
                <div className={styles.musicTrackSelection}>
                  Selected Track
                  <Selection
                    value={selectedPlaylist}
                    onSelect={(value) => {
                      setSelectedPlaylist(value as T_Playlist);
                    }}
                    onOpenChange={(isOpen) => setSelectionOpen(isOpen)}
                  >
                    {Object.values(PlaylistEnum.enum).map((playlist) => (
                      <Selection.Item key={playlist} value={playlist}>
                        {playlist}
                      </Selection.Item>
                    ))}
                  </Selection>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Magnetic>
      </MorphingPopoverContent>
    </MorphingPopover>
  );
}

"use client";

import React from "react";

import { Cog } from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import { styled } from "@mui/material/styles";
import Switch, { SwitchProps } from "@mui/material/Switch";

import { Magnetic } from "./mp/magnetic";

import {
  MorphingPopover,
  MorphingPopoverContent,
  MorphingPopoverTrigger,
} from "./mp/morphing-popover";

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

export default function Settings() {
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
        <div className={styles.settingsTitle}>
          <motion.span layoutId={"icon-settings"} layout={"position"}>
            <Cog className={styles.icon} />
          </motion.span>
          <span>Settings</span>
        </div>

        <div className={styles.section}>
          Troll mode
          <AntSwitch defaultChecked />
        </div>

        <div className={styles.section}>
          Music
          <AntSwitch defaultChecked />
        </div>
      </MorphingPopoverContent>
    </MorphingPopover>
  );
}

"use client";

import React, { useEffect, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { AnimatePresence, motion } from "motion/react";

import tinycolor from "tinycolor2";

import { useSettings } from "@/components/context/settings";

import { SlidingNumber } from "@/components/mp/sliding-number";
import { ProgressiveBlur } from "@/components/mp/progressive-blur";

import { KeybindButton, T_Keybind } from "@/components/keybind";

import levels from "@/components/levels.json";

import styles from "./page.module.scss";

const MotionImage = motion.create(Image);

let currentLevelGlobal = 1;

export default function Home() {
  const router = useRouter();

  const { maxLevel, setMaxLevel } = useSettings();

  const [selectedLevel, setSelectedLevel] =
    useState<number>(currentLevelGlobal);
  const [startLoading, setStartLoading] = useState<boolean>(false);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>welcome to kapow</h1>

        <div className={styles.levels}>
          <ProgressiveBlur blurIntensity={2} className={styles.pgBlur} />

          <div className={styles.controls}>
            <KeybindButton
              forcetheme={"dark"}
              keybinds={[T_Keybind.left_arrow]}
              onPress={() => {
                if (selectedLevel > 1) {
                  setSelectedLevel(selectedLevel - 1);
                }
              }}
              className={styles.leftBtn}
              disabled={startLoading || selectedLevel <= 1}
              loading={startLoading}
              loadingTextEnabled={false}
              reversed={true}
            >
              Prev
            </KeybindButton>

            <KeybindButton
              forcetheme={"dark"}
              keybinds={[T_Keybind.right_arrow]}
              onPress={() => {
                let currentMaxLevel = maxLevel;

                if (selectedLevel >= maxLevel && maxLevel < levels.length) {
                  let res = confirm("Unlock all levels?");

                  if (!res) return;

                  res = confirm("Are you sure? This will unlock all levels!");

                  if (!res) return;

                  res = confirm("This action cannot be undone !");

                  if (!res) return;

                  setMaxLevel(levels.length);
                }

                setSelectedLevel((prev) =>
                  Math.min(Math.min(prev + 1, levels.length), currentMaxLevel),
                );
              }}
              disabled={startLoading || selectedLevel >= levels.length}
              loading={startLoading}
              loadingTextEnabled={false}
            >
              Next
            </KeybindButton>
          </div>

          <AnimatePresence mode="popLayout">
            <MotionImage
              key={selectedLevel}
              src={`/${selectedLevel}.jpg`}
              alt={"dwa"}
              width={400}
              height={400}
              className={styles.kapow}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          </AnimatePresence>
        </div>
      </div>

      <div className={styles.menuCtn}>
        <p className={styles.levelIndicator}>Selected Level</p>
        <div
          className={styles.levelNumber}
          style={{
            color: tinycolor({ h: 120, s: 1, l: 0.5 })
              .spin((-120 * (selectedLevel - 1)) / (levels.length - 1))
              .toHexString(),
          }}
        >
          <SlidingNumber value={selectedLevel} />
        </div>
      </div>

      <KeybindButton
        forcetheme={"dark"}
        keybinds={[T_Keybind.enter]}
        onPress={() => {
          setStartLoading(true);

          currentLevelGlobal = selectedLevel;

          setTimeout(() => {
            router.push(`/level/${selectedLevel}`);
          }, 750);
        }}
        disabled={startLoading}
        loading={startLoading}
        loadingText={"Please wait..."}
      >
        Start
      </KeybindButton>
    </div>
  );
}

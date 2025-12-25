"use client";

import React, { useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { AnimatePresence, motion } from "motion/react";

import tinycolor from "tinycolor2";

import styles from "./page.module.scss";

import { KeybindButton, T_Keybind } from "@/components/keybind";

import { SlidingNumber } from "@/components/mp/sliding-number";
import { ProgressiveBlur } from "@/components/mp/progressive-blur";

import levels from "@/components/levels.json";

const MotionImage = motion.create(Image);

let currentLevelGlobal = 1;

export default function Home() {
  const [selectedLevel, setSelectedLevel] =
    useState<number>(currentLevelGlobal);
  const [startLoading, setStartLoading] = useState<boolean>(false);

  const router = useRouter();

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
                if (selectedLevel < levels.length) {
                  setSelectedLevel(selectedLevel + 1);
                }
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

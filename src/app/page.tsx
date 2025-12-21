"use client";

import React, { useState } from "react";

import Image from "next/image";

import { AnimatePresence, motion } from "framer-motion";
import tinycolor from "tinycolor2";

import styles from "./page.module.scss";

import { KeybindButton, T_Keybind } from "@/components/keybind";

import { SlidingNumber } from "@/components/mp/sliding-number";

import levels from "@/components/levels.json";
import { start } from "node:repl";

const MotionImage = motion(Image);

export default function Home() {
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [startLoading, setStartLoading] = useState<boolean>(false);

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>welcome to kapow</h1>

          <div className={styles.levels}>
            <div className={styles.controls}>
              <motion.button
                className={styles.select}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: selectedLevel > 1 ? (startLoading ? 0.8 : 1) : 0,
                  scale: selectedLevel > 1 ? 1 : 0.8,
                  filter: selectedLevel > 1 ? "blur(0px)" : "blur(4px)",
                }}
                whileHover={{
                  scale: startLoading ? 1 : 1.1,
                }}
                whileTap={{
                  scale: 1,
                }}
                onClick={() => {
                  if (selectedLevel > 1) {
                    setSelectedLevel(selectedLevel - 1);
                  }
                }}
                disabled={startLoading}
              >
                {"<"}
              </motion.button>
              <motion.button
                className={styles.select}
                initial={{ opacity: 0 }}
                animate={{
                  opacity:
                    selectedLevel < levels.length
                      ? startLoading
                        ? 0.8
                        : 1
                      : 0,
                  scale: selectedLevel < levels.length ? 1 : 0.8,
                  filter:
                    selectedLevel < levels.length ? "blur(0px)" : "blur(4px)",
                }}
                whileHover={{
                  scale: startLoading ? 1 : 1.1,
                }}
                whileTap={{
                  scale: 1,
                }}
                onClick={() => {
                  if (selectedLevel < levels.length) {
                    setSelectedLevel(selectedLevel + 1);
                  }
                }}
                disabled={startLoading}
              >
                {">"}
              </motion.button>
            </div>

            <AnimatePresence mode="popLayout">
              <MotionImage
                key={selectedLevel}
                src={`/${selectedLevel}.jpg`}
                alt={"dwa"}
                width={400}
                height={400}
                className={styles.kapow}
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.2 }}
              />
            </AnimatePresence>

            {/*<Image*/}
            {/*  src={`/${selectedLevel}.jpg`}*/}
            {/*  alt={"dwa"}*/}
            {/*  width={400}*/}
            {/*  height={400}*/}
            {/*  className={styles.kapow}*/}
            {/*/>*/}
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
          keybinds={[T_Keybind.enter]}
          onPress={() => {
            console.log("d");
            setStartLoading(true);
          }}
          textClassName={styles.overlayButtonText}
          disabled={startLoading}
          iconClassName={styles.overlayButtonIcon}
          loading={startLoading}
          loadingText={"Please wait..."}
        >
          Start
        </KeybindButton>

        {/*<div>*/}
        {/*  <h1>Choose your level:</h1>*/}
        {/*  <select>*/}
        {/*    {levels.map((level) => (*/}
        {/*      <option value={level.level} key={level.level}>*/}
        {/*        {level.level}*/}
        {/*      </option>*/}
        {/*    ))}*/}
        {/*  </select>*/}
        {/*  <br />*/}
        {/*  <button>Start!</button>*/}
        {/*</div>*/}
      </div>
    </div>
  );
}

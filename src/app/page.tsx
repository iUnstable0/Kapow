"use client";

import React, { useState, useEffect } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { AnimatePresence, motion } from "motion/react";
import useSound from "use-sound";

import tinycolor from "tinycolor2";

import styles from "./page.module.scss";

import { KeybindButton, T_Keybind } from "@/components/keybind";

import { SlidingNumber } from "@/components/mp/sliding-number";
import { ProgressiveBlur } from "@/components/mp/progressive-blur";
import { TextMorph } from "@/components/mp/text-morph";

import levels from "@/components/levels.json";

const MotionImage = motion.create(Image);

let hasUserInteractedGlobal = false;
let currentLevelGlobal = 1;

export default function Home() {
  const [selectedLevel, setSelectedLevel] =
    useState<number>(currentLevelGlobal);
  const [startLoading, setStartLoading] = useState<boolean>(false);

  const [siteEntered, setSiteEntered] = useState<boolean>(
    hasUserInteractedGlobal,
  );

  const [kapowLoaded, setKapowLoaded] = useState<boolean>(false);

  const router = useRouter();

  const [playMain, { stop: stopMain }] = useSound("/main.mp3", {
    volume: 0.5,
    interrupt: true,
    loop: true,
    onload: () => {
      setKapowLoaded(true);
    },
  });

  // useEffect(() => {
  //   // if (siteEntered && kapowLoaded) {
  //   playMain();
  //   // }
  // }, []);
  // }, [siteEntered, kapowLoaded, playMain]);

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {!siteEntered && (
          <motion.div
            key="welcome"
            className={styles.welcome}
            initial={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(12px)" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            onClick={() => {
              if (!kapowLoaded) return;

              if (!siteEntered) {
                setSiteEntered(true);

                hasUserInteractedGlobal = true;

                playMain();
              }
            }}
          >
            <h1 className={styles.welcomeTitle}>Welcome!</h1>
            <div className={styles.welcomeMessage}>
              <TextMorph>
                {kapowLoaded
                  ? "Click anywhere to start!"
                  : "Loading, please wait..."}
              </TextMorph>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

            {/*<motion.button*/}
            {/*  className={styles.select}*/}
            {/*  initial={{ opacity: 0 }}*/}
            {/*  animate={{*/}
            {/*    opacity: selectedLevel > 1 ? (startLoading ? 0.8 : 1) : 0,*/}
            {/*    scale: selectedLevel > 1 ? 1 : 0.8,*/}
            {/*    filter: selectedLevel > 1 ? "blur(0px)" : "blur(4px)",*/}
            {/*  }}*/}
            {/*  whileHover={{*/}
            {/*    scale: startLoading ? 1 : 1.1,*/}
            {/*  }}*/}
            {/*  whileTap={{*/}
            {/*    scale: 1,*/}
            {/*  }}*/}
            {/*  onClick={() => {*/}
            {/*    if (selectedLevel > 1) {*/}
            {/*      setSelectedLevel(selectedLevel - 1);*/}
            {/*    }*/}
            {/*  }}*/}
            {/*  disabled={startLoading}*/}
            {/*>*/}
            {/*  {"<"}*/}
            {/*</motion.button>*/}

            {/*<motion.button*/}
            {/*  className={styles.select}*/}
            {/*  initial={{ opacity: 0 }}*/}
            {/*  animate={{*/}
            {/*    opacity:*/}
            {/*      selectedLevel < levels.length*/}
            {/*        ? startLoading*/}
            {/*          ? 0.8*/}
            {/*          : 1*/}
            {/*        : 0,*/}
            {/*    scale: selectedLevel < levels.length ? 1 : 0.8,*/}
            {/*    filter:*/}
            {/*      selectedLevel < levels.length ? "blur(0px)" : "blur(4px)",*/}
            {/*  }}*/}
            {/*  whileHover={{*/}
            {/*    scale: startLoading ? 1 : 1.1,*/}
            {/*  }}*/}
            {/*  whileTap={{*/}
            {/*    scale: 1,*/}
            {/*  }}*/}
            {/*  onClick={() => {*/}
            {/*    if (selectedLevel < levels.length) {*/}
            {/*      setSelectedLevel(selectedLevel + 1);*/}
            {/*    }*/}
            {/*  }}*/}
            {/*  disabled={startLoading}*/}
            {/*>*/}
            {/*  {">"}*/}
            {/*</motion.button>*/}
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
        forcetheme={"dark"}
        keybinds={[T_Keybind.enter]}
        onPress={() => {
          setStartLoading(true);

          currentLevelGlobal = selectedLevel;

          setTimeout(() => {
            router.push(`/level/${selectedLevel}`);
          }, 1000);
        }}
        disabled={startLoading}
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
  );
}

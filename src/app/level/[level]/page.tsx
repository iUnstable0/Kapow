"use client";

import React, { use, useState, useRef, useEffect } from "react";

import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "motion/react";
import { DateTime } from "luxon";
import { Howl } from "howler";

import { KeybindButton, T_Keybind } from "@/components/keybind";

import styles from "./page.module.scss";
import levels from "@/components/levels.json";

// import useSound from "use-sound";

export default function Page({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = use(params);

  const router = useRouter();

  const [gameStarted, setGameStarted] = useState(false);
  const [stage, setStage] = useState<number>(0);

  const voicesRef = useRef<{ [key: string]: Howl }>({});

  const myLevel = levels.find((lvl) => lvl.level === parseInt(level, 10));

  useEffect(() => {
    if (!myLevel) {
      router.push("/");
    }
  }, [myLevel, router]);

  // const [playMain, { stop: stopMain }] = useSound("/main.mp3", {
  //   volume: 0.5,
  //   interrupt: true,
  //   loop: true,
  //   onload: () => {
  //     setKapowLoaded(true);
  //   },
  // });

  useEffect(() => {
    if (!myLevel?.quiz) return;

    const currentVoices = voicesRef.current;

    myLevel.quiz.forEach((q) => {
      currentVoices[q.voice] = new Howl({
        src: [`/level${level}/${q.voice}`],
        volume: 0.7,
      });
    });

    return () => {
      Object.values(currentVoices).forEach((sound) => sound.unload());
    };
  }, [myLevel, level]);

  if (!myLevel) return null;

  const playSound = (sound: string) => {
    const voice = voicesRef.current[sound];

    if (voice) {
      voice.play();
    }
  };

  return (
    <div className={styles.container}>
      <AnimatePresence mode={"wait"}>
        {!gameStarted && (
          <motion.div
            className={styles.titleCtn}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            key={"title-ctn"}
          >
            <h1 className={styles.title}>Level {level}</h1>
            <p className={styles.desc}>
              {myLevel.timer > 0
                ? `
          Timer: ${DateTime.fromSeconds(myLevel.timer).toFormat("mm:ss")} minutes`
                : `Timer: no timer`}
            </p>
          </motion.div>
        )}

        {!gameStarted && (
          <motion.div
            className={styles.toolrow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            key={"toolbar"}
          >
            <KeybindButton
              forcetheme={"dark"}
              keybinds={[T_Keybind.escape]}
              onPress={() => {
                router.back();
              }}
              disabled={gameStarted}
              loadingTextEnabled={false}
              reversed={true}
              dangerous={true}
            >
              Back
            </KeybindButton>

            <KeybindButton
              forcetheme={"dark"}
              keybinds={[T_Keybind.enter]}
              onPress={() => {
                setGameStarted(true);
              }}
              disabled={gameStarted}
              loadingTextEnabled={false}
            >
              Play
            </KeybindButton>
          </motion.div>
        )}

        {gameStarted && (
          <motion.div
            className={styles.gameCtn}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            key={`game-ctn-${stage}`}
          >
            z
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

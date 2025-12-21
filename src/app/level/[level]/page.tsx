"use client";

import React, { use, useState } from "react";

import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "motion/react";
import { DateTime } from "luxon";

import { KeybindButton, T_Keybind } from "@/components/keybind";

import styles from "./page.module.scss";
import levels from "@/components/levels.json";

export default function Page({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = use(params);

  const router = useRouter();

  const [gameStarted, setGameStarted] = useState(false);

  const myLevel = levels.find((lvl) => lvl.level === parseInt(level, 10));

  if (!myLevel) {
    router.push("/");
    return null;
  }

  return (
    <div className={styles.container}>
      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  );
}

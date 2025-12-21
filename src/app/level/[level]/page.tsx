"use client";

import { use } from "react";

import React from "react";

import { KeybindButton, T_Keybind } from "@/components/keybind";

import styles from "./page.module.scss";
import levels from "@/components/levels.json";

export default function Page({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = use(params);

  return (
    <div className={styles.container}>
      <div className={styles.titleCtn}>
        <h1 className={styles.title}>Level {level}</h1>
        <p className={styles.desc}>You have 2 minutes!</p>
      </div>

      <div className={styles.toolrow}>
        <KeybindButton
          forcetheme={"dark"}
          keybinds={[T_Keybind.escape]}
          onPress={() => {
            // if (selectedLevel < levels.length) {
            //   setSelectedLevel(selectedLevel + 1);
            // }
          }}
          // disabled={startLoading || selectedLevel >= levels.length}
          // loading={startLoading}
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
            // if (selectedLevel < levels.length) {
            //   setSelectedLevel(selectedLevel + 1);
            // }
          }}
          // disabled={startLoading || selectedLevel >= levels.length}
          // loading={startLoading}
          loadingTextEnabled={false}
        >
          Play
        </KeybindButton>
      </div>
    </div>
  );
}

"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import Image from "next/image";

import { useRouter } from "next/navigation";

import clsx from "clsx";

import { motion, AnimatePresence } from "motion/react";
import { Howl } from "howler";

import { useLevel } from "@/components/level";

import { ProgressiveBlur } from "@/components/mp/progressive-blur";

import Keybind, { KeybindButton, T_Keybind } from "@/components/keybind";

import styles from "./page.module.scss";
import { DateTime } from "luxon";

export default function Page() {
  const { level, timer, quiz, playSound } = useLevel();

  const [flipped, setFlipped] = useState<boolean>(false);

  const [reviewStarted, setReviewStarted] = useState<boolean>(false);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);

  const [reviewIndex, setReviewIndex] = useState<number>(0);

  useEffect(() => {
    setTimeout(() => {
      setReviewStarted(true);
      setFirstLoad(false);
    }, 2000);
  }, []);

  return (
    <div className={styles.container}>
      <AnimatePresence mode={"popLayout"}>
        {!reviewStarted && (
          <motion.div
            className={styles.titleCtn}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            key={"title-ctn"}
          >
            <h1 className={styles.title}>Level {level} Review</h1>
            {firstLoad && <p className={styles.desc}>Loading...</p>}
          </motion.div>
        )}

        {reviewStarted && (
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            key={`stagelabel-${reviewIndex}`}
          >
            <ProgressiveBlur blurIntensity={2} className={styles.pgBlur} />

            <Image
              src={`/level${level}/${quiz[reviewIndex].answer}`}
              alt={"answer image"}
              width={200}
              height={200}
              className={styles.image}
            />

            <div className={styles.controls}>
              {flipped && (
                <KeybindButton
                  keybinds={[T_Keybind.x]}
                  forcetheme={"dark"}
                  onPress={() => {}}
                  // disabled={reviewLoading || returnLoading}
                  // loading={returnLoading}
                  // loadingText={"Please wait..."}
                  // loadingTextEnabled={true}
                  // reversed={true}
                  dangerous={true}
                >
                  Mark for Review
                </KeybindButton>
              )}

              <KeybindButton
                keybinds={[T_Keybind.space]}
                forcetheme={"dark"}
                onPress={() => {}}
                // disabled={reviewLoading || returnLoading}
                // loading={returnLoading}
                // loadingText={"Please wait..."}
                // loadingTextEnabled={true}
                // reversed={true}
                // dangerous={true}
              >
                Flip
              </KeybindButton>

              {flipped && (
                <KeybindButton
                  keybinds={[T_Keybind.enter]}
                  forcetheme={"dark"}
                  onPress={() => {}}
                  // disabled={reviewLoading || returnLoading}
                  // loading={returnLoading}
                  // loadingText={"Please wait..."}
                  // loadingTextEnabled={true}
                  // reversed={true}
                  // dangerous={true}
                >
                  Next
                </KeybindButton>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

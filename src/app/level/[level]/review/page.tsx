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
import { useGlobalMusic } from "@/components/music";

import { ProgressiveBlur } from "@/components/mp/progressive-blur";

import Keybind, { KeybindButton, T_Keybind } from "@/components/keybind";

import styles from "./page.module.scss";

const MotionImage = motion.create(Image);

export default function Page() {
  const { level, timer, quiz, playSound } = useLevel();
  const { pause, play } = useGlobalMusic();

  const [flipped, setFlipped] = useState<boolean>(false);
  const [flipState, setFlipState] = useState<"question" | "answer">("question");

  const [reviewStarted, setReviewStarted] = useState<boolean>(false);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);

  const [reviewIndex, setReviewIndex] = useState<number>(0);

  const playCardSound = useCallback(() => {
    pause();

    if (flipState === "question") {
      playSound(quiz[reviewIndex].voice);
    } else {
      window.speechSynthesis.speak(
        new SpeechSynthesisUtterance(quiz[reviewIndex].answer.split(".")[0]),
      );
    }

    setTimeout(() => {
      play();
    }, 1000);
  }, [flipState, playSound, quiz, reviewIndex, pause, play]);

  const handleNext = useCallback(() => {
    setFlipped(false);
    setFlipState("question");

    if (reviewIndex + 1 >= quiz.length) {
      // TODO: Play win sound
    } else {
      setReviewIndex(reviewIndex + 1);
    }
  }, [reviewIndex, quiz]);

  const handleFlip = useCallback(() => {
    setFlipped(true);

    if (flipState === "question") {
      setFlipState("answer");
    } else {
      setFlipState("question");
    }
  }, [flipState]);

  useEffect(() => {
    if (firstLoad) return;

    playCardSound();
  }, [flipState, playCardSound, firstLoad]);

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
            <AnimatePresence mode={"popLayout"}>
              {flipState === "answer" && (
                <motion.div
                  className={styles.pgBlurCtn}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  key={`pgBlur-${reviewIndex}`}
                >
                  <ProgressiveBlur
                    blurIntensity={2}
                    className={styles.pgBlur}
                  />
                </motion.div>
              )}

              {flipState === "question" && (
                <motion.div
                  className={styles.question}
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 0.5 }}
                  key={`question-${reviewIndex}`}
                >
                  {quiz[reviewIndex].question}
                </motion.div>
              )}

              {flipState === "answer" && (
                <MotionImage
                  src={`/level${level}/${quiz[reviewIndex].answer}`}
                  alt={"answer image"}
                  width={200}
                  height={200}
                  className={styles.image}
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 0.5 }}
                  key={`answer-${reviewIndex}`}
                />
              )}
            </AnimatePresence>

            <div className={styles.controls}>
              {flipped && (
                <KeybindButton
                  keybinds={[T_Keybind.x]}
                  forcetheme={"dark"}
                  onPress={() => {
                    handleNext();
                  }}
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
                keybinds={[T_Keybind.s]}
                forcetheme={"dark"}
                onPress={() => {
                  playCardSound();
                }}
                // disabled={reviewLoading || returnLoading}
                // loading={returnLoading}
                // loadingText={"Please wait..."}
                // loadingTextEnabled={true}
                // reversed={true}
                // dangerous={true}
              >
                Play sound
              </KeybindButton>

              <KeybindButton
                keybinds={[T_Keybind.space]}
                forcetheme={"dark"}
                key={"space"}
                onPress={() => {
                  handleFlip();
                }}
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
                  onPress={() => {
                    handleNext();
                  }}
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

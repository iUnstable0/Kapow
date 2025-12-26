"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

import Image from "next/image";

import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "motion/react";

import { useLevel } from "@/components/level";
import { useGlobalMusic } from "@/components/music";

import { ProgressiveBlur } from "@/components/mp/progressive-blur";

import { KeybindButton, T_Keybind } from "@/components/keybind";

import styles from "./page.module.scss";
import { useConfetti } from "@/components/confetti";
import useSound from "use-sound";

const MotionImage = motion.create(Image);

export default function Page() {
  const router = useRouter();

  const { level, quiz, playSound } = useLevel();
  const { fireConfetti } = useConfetti();

  const { pause, play } = useGlobalMusic();

  const isProcessing = useRef(false);

  const [fish, setFish] = useState<boolean>(false);

  const [flipped, setFlipped] = useState<boolean>(false);
  const [flipState, setFlipState] = useState<"question" | "answer">("question");

  const [exitReviewLoading, setExitReviewLoading] = useState<boolean>(false);

  const [queue, setQueue] = useState<typeof quiz>(quiz);
  const [reviews, setReviews] = useState<typeof quiz>([]);

  const [win, setWin] = useState<boolean>(false);

  const [reviewStarted, setReviewStarted] = useState<boolean>(false);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);

  const [reviewIndex, setReviewIndex] = useState<number>(0);

  const [playAlert] = useSound("/alert.mp3", {
    volume: 2,
  });

  const [playBen1] = useSound("/ben/ben 1.mp3", {
    volume: 1,
  });

  const [playBen2] = useSound("/ben/ben 2.mp3", {
    volume: 1,
  });

  const [playBen3] = useSound("/ben/ben 3.mp3", {
    volume: 1,
  });

  const [playBen4] = useSound("/ben/ben 4.mp3", {
    volume: 1,
  });

  const [playBen5] = useSound("/ben/ben 5.mp3", {
    volume: 1,
  });

  const [playLeFishe] = useSound("/lefishe.mp3", {
    volume: 0.5,
    interrupt: true,
    onplay: () => {
      setFish(true);
      pause();
    },
    onend: () => {
      setFish(false);
      play();
    },
  });

  const playBen = useCallback(() => {
    const benSounds = [playBen1, playBen2, playBen3, playBen4, playBen5];
    const randomIndex = Math.floor(Math.random() * benSounds.length);
    benSounds[randomIndex]();
  }, [playBen1, playBen2, playBen3, playBen4, playBen5]);

  const playCardSound = useCallback(() => {
    pause();

    let fishPlayed = false;

    if (flipState === "question") {
      playSound(queue[reviewIndex].voice);
    } else {
      let matchedSwitch = false;

      switch (queue[reviewIndex].answer.split(".")[0]) {
        case "dog":
          playBen();
          matchedSwitch = true;
          break;
        case "fish":
          playLeFishe();
          fishPlayed = true;

          matchedSwitch = true;
          break;
      }

      setTimeout(
        () => {
          const utterance = new SpeechSynthesisUtterance(
            queue[reviewIndex].answer.split(".")[0],
          );

          // utterance.pitch = 0.1;
          // utterance.rate = 0.1;
          // utterance.volume = 1;

          window.speechSynthesis.speak(utterance);
        },
        matchedSwitch ? 1000 : 0,
      );
    }

    if (!fishPlayed && !fish) {
      setTimeout(() => {
        play();
      }, 1000);
    }
  }, [
    pause,
    flipState,
    playSound,
    queue,
    reviewIndex,
    playBen,
    playLeFishe,
    play,
  ]);

  const markForReview = useCallback(
    (item: (typeof quiz)[number]) => {
      if (reviews.find((rev) => rev.question === item.question)) return;

      setReviews((prev) => [...prev, item]);
    },
    [reviews],
  );

  const handleNext = useCallback(
    (review: boolean) => {
      if (isProcessing.current) return;

      isProcessing.current = true;

      if (review) {
        markForReview(queue[reviewIndex]);
      } else {
        if (
          reviews.find((rev) => rev.question === queue[reviewIndex].question)
        ) {
          // alert("Item was in review list, remove now");
          setReviews((prev) =>
            prev.filter((rev) => rev.question !== queue[reviewIndex].question),
          );
        }
      }

      setFlipped(false);
      setFlipState("question");

      if (reviewIndex + 1 >= queue.length) {
        setWin(true);
        setReviewStarted(false);
        setReviewIndex(0);

        isProcessing.current = false;
      } else {
        setReviewIndex((prev) => Math.min(prev + 1, queue.length - 1));
        console.log("FC NEXT");

        setTimeout(() => {
          isProcessing.current = false;
          console.log("FC UNLOCK");
        }, 300);
      }
    },
    [reviewIndex, queue, markForReview, reviews],
  );

  const handleFlip = useCallback(() => {
    setFlipped(true);

    if (flipState === "question") {
      setFlipState("answer");
    } else {
      setFlipState("question");
    }
  }, [flipState]);

  useEffect(() => {
    if (!reviewStarted) return;

    playCardSound();
  }, [flipState, playCardSound, reviewStarted]);

  useEffect(() => {
    if (!win) return;

    if (reviews.length < quiz.length) {
      fireConfetti(true);
    } else {
      playAlert();
    }
  }, [win, fireConfetti, playAlert, reviews, quiz]);

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
            {!firstLoad && reviews.length === 0 && (
              <p className={styles.desc}>Get ready to review!</p>
            )}
            {!firstLoad &&
              reviews.length > 0 &&
              reviews.length < quiz.length && (
                <p className={styles.desc}>
                  You have {reviews.length} item
                  {reviews.length > 1 ? "s" : ""} left to review.
                </p>
              )}
            {!firstLoad && !(reviews.length < quiz.length) && (
              <p className={styles.desc}>You failed all reviews lol.</p>
            )}
          </motion.div>
        )}

        {!firstLoad && !reviewStarted && (
          <motion.div
            className={styles.reviewTools}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            key={"reviewremaining"}
          >
            {reviews.length > 0 && reviews.length < quiz.length && (
              <KeybindButton
                keybinds={[T_Keybind.shift, T_Keybind.enter]}
                forcetheme={"dark"}
                onPress={() => {
                  setQueue(reviews);
                  setReviews([]);
                  setWin(false);

                  setReviewStarted(true);
                }}
                // disabled={reviewLoading || returnLoading}
                // loading={returnLoading}
                // loadingText={"Please wait..."}
                // loadingTextEnabled={true}
                // reversed={true}
              >
                Review remaining
              </KeybindButton>
            )}

            <KeybindButton
              keybinds={[T_Keybind.enter]}
              forcetheme={"dark"}
              onPress={() => {
                setQueue(quiz);
                setReviews([]);
                setWin(false);

                setReviewStarted(true);
              }}
              // disabled={reviewLoading || returnLoading}
              // loading={returnLoading}
              // loadingText={"Please wait..."}
              // loadingTextEnabled={true}
              // reversed={true}
            >
              {reviews.length > 0
                ? reviews.length < quiz.length
                  ? "Review all"
                  : "Review again"
                : "Review"}
            </KeybindButton>
          </motion.div>
        )}

        {!reviewStarted && (
          <motion.div
            className={styles.toolbarTopRight}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            key={"exitreview"}
          >
            <KeybindButton
              keybinds={[T_Keybind.escape]}
              onPress={() => {
                setExitReviewLoading(true);

                setTimeout(() => {
                  router.push(`/level/${level}`);
                }, 750);
              }}
              forcetheme={"dark"}
              dangerous={true}
              loading={exitReviewLoading}
              disabled={exitReviewLoading}
              loadingText={"Please wait..."}
              loadingTextEnabled={true}
            >
              Exit Review
            </KeybindButton>
          </motion.div>
        )}

        {reviewStarted && (
          <motion.div
            className={styles.toolbarTopRight}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            key={"exitreview"}
          >
            <KeybindButton
              keybinds={[T_Keybind.escape]}
              onPress={() => {
                setReviewStarted(false);
                setReviewIndex(0);
              }}
              forcetheme={"dark"}
              dangerous={true}
            >
              Exit Review
            </KeybindButton>
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
                  {queue[reviewIndex].question}
                </motion.div>
              )}

              {flipState === "answer" && (
                <MotionImage
                  src={`/level${level}/${queue[reviewIndex].answer}`}
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
                    handleNext(true);
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
                    handleNext(false);
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

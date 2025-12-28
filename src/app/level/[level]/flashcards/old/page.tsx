"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

import Image from "next/image";

import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "motion/react";
import clsx from "clsx";

import useSound from "use-sound";

import { useLevel } from "@/components/level";
import { useGlobalMusic } from "@/components/context/music";
import { useConfetti } from "@/components/confetti";
import { useSettings } from "@/components/context/settings";

import { ProgressiveBlur } from "@/components/mp/progressive-blur";

import { KeybindButton, T_Keybind } from "@/components/keybind";

import styles from "./page.module.scss";
import ProjectorOverlay from "@/components/projector";

const MotionImage = motion.create(Image);

const customScript: {
  [key: string]: { title: string; time: number }[];
} = {
  winAll: [
    {
      title: "A TRIUMPH!",
      time: 2000,
    },
    {
      title: "$wait$",
      time: 500,
    },
    {
      title: "THE CRITICS ARE WEEPING",
      time: 2000,
    },
    {
      title: "$wait$",
      time: 500,
    },
    {
      title: "A CINEMATIC MASTERPIECE",
      time: 2000,
    },
    {
      title: "$wait$",
      time: 500,
    },
    {
      title: "NO NOTES.",
      time: 1500,
    },
    {
      title: "PURE. CINEMA.",
      time: 2000,
    },
  ],

  winSome: [
    {
      title: "THE DAILIES ARE IN...",
      time: 2000,
    },
    {
      title: "$wait$",
      time: 1000,
    },
    {
      title: "VISUALLY STUNNING...",
      time: 1500,
    },
    {
      title: "$wait$",
      time: 500,
    },
    {
      title: "BUT NARRATIVELY WEAK",
      time: 2000,
    },
    {
      title: "$wait$",
      time: 500,
    },
    {
      title: "YOU GOT $score$ OUT OF $total$",
      time: 2000,
    },
    {
      title: "$wait$",
      time: 500,
    },
    {
      title: "WE NEED RESHOOTS",
      time: 2000,
    },
    {
      title: "BACK TO THE STUDIO",
      time: 1500,
    },
  ],

  lostAll: [
    {
      title: "CUT! CUT!",
      time: 1500,
    },
    {
      title: "$wait$",
      time: 200,
    },
    {
      title: "WHO HIRED THIS GUY?",
      time: 3000,
    },
    {
      title: "$wait$",
      time: 500,
    },
    {
      title: "A BOX OFFICE BOMB",
      time: 2000,
    },
    {
      title: "$wait$",
      time: 500,
    },
    {
      title: "ZERO. ZILCH. NADA.",
      time: 2000,
    },
    {
      title: "$wait$",
      time: 1000,
    },
    {
      title: "MY CAREER IS RUINED",
      time: 2000,
    },
    {
      title: "GET OUT OF MY OFFICE",
      time: 2000,
    },
  ],

  fish: [
    {
      title: "KILLER FISH FROM SAN DIEGO",
      time: 2000,
    },
    {
      title: "$wait$",
      time: 1000,
    },
    {
      title: "I DON'T KNOW WHAT I AM",
      time: 2000,
    },
    {
      title: "$wait$",
      time: 500,
    },
    {
      title: "BUT I TASTE VERY GOOD",
      time: 2000,
    },
    {
      title: "$wait$",
      time: 1000,
    },
    {
      title: "IM A KILLER FISH!!!",
      time: 2000,
    },
  ],

  sharp: [
    {
      title: "I AM THE TWINSTAR",
      time: 2000,
    },
    {
      title: "$wait$",
      time: 800,
    },
    {
      title: "SCIENTIFICALLY DESIGNED",
      time: 2000,
    },
    {
      title: "$wait$",
      time: 500,
    },
    {
      title: "TO DESTROY",
      time: 1500,
    },
    {
      title: "$wait$",
      time: 200,
    },
    {
      title: "HUMANITY",
      time: 100,
    },
    {
      title: "$wait$",
      time: 100,
    },
    {
      title: "VEGETABLES",
      time: 2000,
    },
    {
      title: "$wait$",
      time: 1000,
    },
    {
      title: "PLS BUY ME IM $39.99",
      time: 2000,
    },
    {
      title: "$wait$",
      time: 3000,
    },
    {
      title: "OH BTW THE ANSWER WAS 'sharp'",
      time: 2000,
    },
  ],

  fence: [
    {
      title: "FENCE",
      time: 2000,
    },
    {
      title: "$wait$",
      time: 4500,
    },
    {
      title: "BOO!",
      time: 2000,
    },
  ],
};

export default function Page() {
  const router = useRouter();

  const textTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scriptTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const { level, quiz, playSound } = useLevel();
  const { fireConfetti } = useConfetti();
  const { trollModeEnabled, flashcardsMode } = useSettings();

  const { siteEntered } = useGlobalMusic();

  const isProcessing = useRef(false);

  const [toolsLocked, setToolsLocked] = useState<boolean>(false);

  const [flipped, setFlipped] = useState<boolean>(false);
  const [flipState, setFlipState] = useState<"question" | "answer">("question");

  const [exitReviewLoading, setExitReviewLoading] = useState<boolean>(false);

  const [queue, setQueue] = useState<typeof quiz>(quiz);
  const [reviews, setReviews] = useState<typeof quiz>([]);

  const [win, setWin] = useState<boolean>(false);

  const [reviewStarted, setReviewStarted] = useState<boolean>(false);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);

  const [reviewIndex, setReviewIndex] = useState<number>(0);

  const [activeText, setActiveText] = useState<string | null>(null);

  const [playAlert] = useSound("/alert.mp3", {
    volume: 2,
  });

  const [playFilmStart] = useSound("/filmstart.mp3", {
    volume: 0.1,
    interrupt: true,
  });

  const [playFilmRoll, { stop: stopFilmRoll }] = useSound(
    "/filmloopbetter.mp3",
    {
      volume: 0.1,
      loop: true,
      html5: true,
      interrupt: true,
    },
  );

  const [playEntertainer, { stop: stopEntertainer }] = useSound(
    "/entertainer.mp3",
    {
      volume: 0.5,
      loop: true,
      html5: true,
      interrupt: true,
    },
  );

  const clearAllTimeouts = useCallback(() => {
    if (textTimeoutRef.current) {
      clearTimeout(textTimeoutRef.current);
      textTimeoutRef.current = null;
    }

    scriptTimeoutsRef.current.forEach((id) => clearTimeout(id));
    scriptTimeoutsRef.current = [];
  }, []);

  const runScript = (
    script: (typeof customScript)[keyof typeof customScript],
  ) => {
    setToolsLocked(true);

    let totalTime = 0;

    script.forEach((line) => {
      totalTime += line.time;

      const id = setTimeout(() => {
        if (line.title === "$wait$") {
          setActiveText(null);
        } else {
          setActiveText(line.title);
        }
      }, totalTime - line.time);

      scriptTimeoutsRef.current.push(id);
    });

    const id = setTimeout(() => {
      setActiveText(null);
      setToolsLocked(false);
    }, totalTime);

    scriptTimeoutsRef.current.push(id);
  };

  const playCardSound = useCallback(
    (wait: boolean = false) => {
      if (flipState === "answer") {
        setToolsLocked(true);
      }

      if (wait) {
        setTimeout(() => {
          // eslint-disable-next-line react-hooks/immutability
          playCardSound();
        }, 1000);

        return;
      }

      clearAllTimeouts();

      let custom = false;

      if (flipState === "question") {
        playSound(queue[reviewIndex].voice);
      } else {
        const speech = queue[reviewIndex].answer.split(".")[0];

        if (customScript[speech]) {
          custom = true;

          runScript(customScript[speech]);
        } else {
          setActiveText(speech);
        }

        if (!custom) {
          textTimeoutRef.current = setTimeout(() => {
            setActiveText(null);
            setToolsLocked(false);
          }, 2000);
        }
      }
    },
    [flipState, playSound, queue, reviewIndex, setActiveText, clearAllTimeouts],
  );

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

      const currentCard = queue[reviewIndex];

      if (review) {
        markForReview(currentCard);
      } else {
        setReviews((prev) =>
          prev.filter((rev) => rev.question !== currentCard.question),
        );
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
    [queue, reviewIndex, markForReview, isProcessing],
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

    playCardSound(true);
    // setTimeout(
    //   () => {
    //   },
    //   flipState === "question" ? 0 : 1000,
    // );
  }, [flipState, playCardSound, reviewStarted]);

  useEffect(() => {
    if (!win) return;

    if (reviews.length < queue.length) {
      if (reviews.length === 0) {
        fireConfetti(false);

        runScript(customScript.winAll);
      } else {
        const score = queue.length - reviews.length;
        const total = queue.length;

        const modifiedScript = customScript.winSome.map((line) => {
          return {
            ...line,
            title: line.title
              .replace("$score$", score.toString())
              .replace("$total$", total.toString()),
          };
        });

        runScript(modifiedScript);
      }
    } else {
      runScript(customScript.lostAll);
      playAlert();
    }
  }, [win, fireConfetti, playAlert, reviews, queue]);

  // useEffect(() => {
  //   const speech = queue[reviewIndex]?.answer.split(".")[0];
  //
  //   if (!speech) return;
  //
  //   if (customScript[speech] && flipState === "answer") {
  //     setToolsLocked(true);
  //   } else {
  //     setToolsLocked(false);
  //   }
  // }, [flipState, queue, reviewIndex]);

  // useEffect(() => {
  //   if (flipState === "question") {
  //     setToolsLocked(false);
  //   } else {
  //     setToolsLocked(true);
  //   }
  // }, [flipState, reviewIndex]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     // setReviewStarted(true);
  //     // setFirstLoad(false);
  //
  //     playEntertainer();
  //   }, 2000);
  // }, [playEntertainer]);

  useEffect(() => {
    if (!siteEntered) return;

    playFilmStart();
    playFilmRoll();

    setTimeout(() => {
      if (!win) {
        setReviewStarted(true);
        setFirstLoad(false);
      }

      playEntertainer();
    }, 3000);

    return () => {
      stopFilmRoll();
      stopEntertainer();
      clearAllTimeouts();
    };
  }, [
    playFilmRoll,
    playFilmStart,
    playEntertainer,
    stopFilmRoll,
    stopEntertainer,
    siteEntered,
    clearAllTimeouts,
  ]);

  useEffect(() => {
    router.replace(`/level/${level}/flashcards/${flashcardsMode}`);
  }, [flashcardsMode, level, router]);

  return (
    <div className={clsx(styles.container, "animate-projector-jitter")}>
      <ProjectorOverlay />

      {activeText && (
        <div className={styles.frameCtn}>
          <Image
            src={"/frame-optimised.png"}
            alt={"frame"}
            width={200}
            height={200}
            className={styles.frame}
            priority={true}
          />

          <div className={styles.frameText}>{activeText.toUpperCase()}</div>

          <div className={styles.actionTextTools}>
            <KeybindButton
              keybinds={[T_Keybind.escape]}
              onPress={() => {
                clearAllTimeouts();

                setActiveText(null);
                setToolsLocked(false);
              }}
              forceTheme={"dark"}
            >
              Skip Text
            </KeybindButton>
          </div>
        </div>
      )}

      <AnimatePresence mode={"popLayout"}>
        {!reviewStarted && !toolsLocked && (
          <motion.div
            className={styles.titleCtn}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            key={"title-ctn"}
          >
            <h1 className={styles.title}>Level {level} Flashcards</h1>

            {firstLoad && <p className={styles.desc}>Loading...</p>}

            {!firstLoad && reviews.length === 0 && !win && (
              <p className={styles.desc}>Get ready to review!</p>
            )}

            {/*{!firstLoad && reviews.length === 0 && win && (*/}
            {/*  <p className={styles.desc}>Great job reviewing! Try again?</p>*/}
            {/*)}*/}

            {!firstLoad &&
              reviews.length > 0 &&
              reviews.length < quiz.length && (
                <p className={styles.desc}>
                  You have {reviews.length} item
                  {reviews.length > 1 ? "s" : ""} left to review.
                </p>
              )}

            {!firstLoad && !(reviews.length < quiz.length) && (
              <p className={styles.desc}>Why are you still here</p>
            )}
          </motion.div>
        )}

        {!firstLoad && !reviewStarted && !toolsLocked && (
          <motion.div
            className={styles.reviewTools}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            key={"reviewremaining"}
          >
            <KeybindButton
              keybinds={[T_Keybind.escape]}
              onPress={() => {
                setExitReviewLoading(true);

                setTimeout(() => {
                  router.push(`/level/${level}`);
                }, 750);
              }}
              forceTheme={"dark"}
              dangerous={true}
              loading={exitReviewLoading}
              disabled={exitReviewLoading || !!activeText || toolsLocked}
              loadingText={"Please wait..."}
              loadingTextEnabled={true}
            >
              Exit Flashcards
            </KeybindButton>

            {reviews.length > 0 && reviews.length < quiz.length && (
              <KeybindButton
                keybinds={[T_Keybind.shift, T_Keybind.enter]}
                forceTheme={"dark"}
                onPress={() => {
                  setQueue(reviews);
                  setReviews([]);

                  setWin(false);
                  setFlipped(false);

                  setReviewStarted(true);
                }}
                disabled={!!activeText || toolsLocked}
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
              forceTheme={"dark"}
              onPress={() => {
                setQueue(quiz);
                setReviews([]);
                setWin(false);

                setReviewStarted(true);
              }}
              disabled={!!activeText || toolsLocked}
              // loading={returnLoading}
              // loadingText={"Please wait..."}
              // loadingTextEnabled={true}
              // reversed={true}
            >
              {reviews.length > 0
                ? reviews.length < quiz.length
                  ? "Review all"
                  : "Review again"
                : win
                  ? "Redo"
                  : "Start"}
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
              keybinds={[T_Keybind.shift, T_Keybind.escape]}
              onPress={() => {
                setReviewStarted(false);
                setReviewIndex(0);
              }}
              disabled={!!activeText || toolsLocked}
              forceTheme={"dark"}
              dangerous={true}
            >
              Quit Session
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
                <>
                  <MotionImage
                    key={`answer-glow-${reviewIndex}`}
                    src={`/level${level}/${
                      queue[reviewIndex].answer.split(".")[0]
                    }.old.gif`}
                    alt={"glow background"}
                    width={200}
                    height={200}
                    className={styles.glowLayer}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />

                  <MotionImage
                    key={`answer-${reviewIndex}_${trollModeEnabled}`}
                    src={`/level${level}/${
                      queue[reviewIndex].answer.split(".")[0]
                    }.old.gif`}
                    alt={"answer image"}
                    width={200}
                    height={200}
                    className={styles.image}
                    initial={{
                      opacity: 0,
                      filter: "blur(10px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter:
                        "blur(0px) sepia(0.75) contrast(1.2) saturate(0.7) brightness(0.7)",
                    }}
                    exit={{ opacity: 0, filter: "blur(10px) sepia(0.75)" }}
                    transition={{ duration: 0.5 }}
                  />
                </>
              )}

              {/*{flipState === "answer" && (*/}
              {/*  <MotionImage*/}
              {/*    key={`answer-${reviewIndex}_${trollModeEnabled}`}*/}
              {/*    src={`/level${level}/${*/}
              {/*      queue[reviewIndex].answer.split(".")[0]*/}
              {/*    }.old.gif`}*/}
              {/*    alt={"answer image"}*/}
              {/*    width={200}*/}
              {/*    height={200}*/}
              {/*    className={styles.image}*/}
              {/*    initial={{*/}
              {/*      opacity: 0,*/}
              {/*      filter: "blur(10px) sepia(0.75)",*/}
              {/*    }}*/}
              {/*    animate={{*/}
              {/*      opacity: 1,*/}
              {/*      filter:*/}
              {/*        "blur(0px) sepia(0.75) contrast(1.2) saturate(0.7) brightness(0.7)",*/}
              {/*    }}*/}
              {/*    exit={{ opacity: 0, filter: "blur(10px) sepia(0.75)" }}*/}
              {/*    transition={{ duration: 0.5 }}*/}
              {/*  />*/}
              {/*)}*/}
            </AnimatePresence>

            <div className={styles.controls}>
              {flipped && (
                <KeybindButton
                  keybinds={[T_Keybind.x]}
                  forceTheme={"dark"}
                  onPress={() => {
                    handleNext(true);
                  }}
                  disabled={!!activeText || toolsLocked}
                  // loading={returnLoading}
                  // loadingText={"Please wait..."}
                  // loadingTextEnabled={true}
                  // reversed={true}
                  dangerous={true}
                >
                  Mark for Review
                </KeybindButton>
              )}

              {flipped && (
                <KeybindButton
                  keybinds={[T_Keybind.d]}
                  forceTheme={"dark"}
                  onPress={() => {
                    window.open(
                      `https://www.thai2english.com/?q=${encodeURIComponent(queue[reviewIndex].question)}`,
                      "_blank",
                    );
                  }}
                  disabled={!!activeText || toolsLocked}

                  // disabled={reviewLoading || returnLoading}
                  // loading={returnLoading}
                  // loadingText={"Please wait..."}
                  // loadingTextEnabled={true}
                  // reversed={true}
                  // dangerous={true}
                >
                  Open Dictionary
                </KeybindButton>
              )}

              <KeybindButton
                keybinds={[T_Keybind.s]}
                forceTheme={"dark"}
                onPress={() => {
                  playCardSound();
                }}
                disabled={!!activeText || toolsLocked}

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
                forceTheme={"dark"}
                key={"space"}
                onPress={() => {
                  handleFlip();
                }}
                disabled={!!activeText || toolsLocked}

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
                  forceTheme={"dark"}
                  onPress={() => {
                    handleNext(false);
                  }}
                  disabled={!!activeText || toolsLocked}

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

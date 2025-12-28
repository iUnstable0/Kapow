"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

import Image from "next/image";

import { useRouter } from "next/navigation";

import { ArrowLeft, BookCopy, Flame, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import useSound from "use-sound";
import clsx from "clsx";

import { useLevel } from "@/components/context/level";
import { useGlobalMusic } from "@/components/context/music";
import { useConfetti } from "@/components/confetti";
import { useSettings } from "@/components/context/settings";

import { ProgressiveBlur } from "@/components/mp/progressive-blur";

import ProjectorOverlay from "@/components/projector";
import { KeybindButton, T_Keybind } from "@/components/keybind";

import styles from "./page.module.scss";

const MotionImage = motion.create(Image);

const customScript: {
  [key: string]: { title: string; time: number }[];
} = {
  winAll: [
    {
      title: "GOOOOD BOY",
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
      title: "IT'S GIVING... MID",
      time: 2000,
    },
    {
      title: "WE NEED RESHOOTS",
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
      title: "ABSOLUTE DOG WATER",
      time: 2000,
    },
    {
      title: "$wait$",
      time: 500,
    },
    {
      title: "$score$ OUT OF $total$???",
      time: 2000,
    },
    {
      title: "$wait$",
      time: 500,
    },
    {
      title: "GO TOUCH SOME GRASS",
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
  //
  // sharp: [
  //   {
  //     title: "I AM THE TWINSTAR",
  //     time: 2000,
  //   },
  //   {
  //     title: "$wait$",
  //     time: 800,
  //   },
  //   {
  //     title: "SCIENTIFICALLY DESIGNED",
  //     time: 2000,
  //   },
  //   {
  //     title: "$wait$",
  //     time: 500,
  //   },
  //   {
  //     title: "TO DESTROY",
  //     time: 1500,
  //   },
  //   {
  //     title: "$wait$",
  //     time: 200,
  //   },
  //   {
  //     title: "HUMANITY",
  //     time: 100,
  //   },
  //   {
  //     title: "$wait$",
  //     time: 100,
  //   },
  //   {
  //     title: "VEGETABLES",
  //     time: 2000,
  //   },
  //   {
  //     title: "$wait$",
  //     time: 1000,
  //   },
  //   {
  //     title: "PLS BUY ME IM $39.99",
  //     time: 2000,
  //   },
  //   {
  //     title: "$wait$",
  //     time: 3000,
  //   },
  //   {
  //     title: "OH BTW THE ANSWER WAS 'sharp'",
  //     time: 2000,
  //   },
  // ],

  fence: [
    {
      title: "FENCE",
      time: 2000,
    },
    {
      title: "$wait$",
      time: 3500,
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

  const [toolsLocked, setToolsLocked] = useState<boolean>(false);

  const [flipped, setFlipped] = useState<boolean>(false);

  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  const [reviewRemainingLoading, setReviewRemainingLoading] =
    useState<boolean>(false);

  const [reviewStarted, setReviewStarted] = useState<boolean>(false);

  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [imagesPreloaded, setImagesPreloaded] = useState<boolean>(false);

  const [win, setWin] = useState<boolean>(false);

  const [flipState, setFlipState] = useState<"question" | "answer">("question");

  const [exitReviewLoading, setExitReviewLoading] = useState<boolean>(false);

  const [queue, setQueue] = useState<typeof quiz>(quiz);
  const [reviews, setReviews] = useState<typeof quiz>([]);

  const [reviewIndex, setReviewIndex] = useState<number>(0);

  const [activeText, setActiveText] = useState<string | null>(null);

  const [entertainerStopped, setEntertainerStopped] = useState<boolean>(false);

  const [playPause] = useSound("/pause.mp3", {
    volume: 1,
    interrupt: true,
  });

  const [playSilence] = useSound("/silence.mp3", {
    volume: 3,
    interrupt: true,
  });

  const [playCry] = useSound("/cry.mp3", {
    volume: 1,
    interrupt: true,
  });

  const [playAngry] = useSound("/angry.mp3", {
    volume: 1,
    interrupt: true,
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
    }
  );

  const [playEntertainer, { stop: stopEntertainer }] = useSound(
    "/entertainer.mp3",
    {
      volume: 0.5,
      loop: true,
      html5: true,
      interrupt: true,
    }
  );

  const clearAllTimeouts = useCallback(() => {
    if (textTimeoutRef.current) {
      clearTimeout(textTimeoutRef.current);
      textTimeoutRef.current = null;
    }

    scriptTimeoutsRef.current.forEach((id) => clearTimeout(id));
    scriptTimeoutsRef.current = [];
  }, []);

  const runScript = useCallback(
    (script: (typeof customScript)[keyof typeof customScript]) => {
      setToolsLocked(true);

      let totalTime = 0;

      const score = queue.length - reviews.length;
      const total = queue.length;

      script.forEach((line) => {
        totalTime += line.time;

        const id = setTimeout(() => {
          if (line.title === "$wait$") {
            setActiveText(null);
          } else {
            setActiveText(
              line.title
                .replace("$score$", score.toString())
                .replace("$total$", total.toString())
            );
          }
        }, totalTime - line.time);

        scriptTimeoutsRef.current.push(id);
      });

      const id = setTimeout(() => {
        setActiveText(null);
        setToolsLocked(false);
      }, totalTime);

      scriptTimeoutsRef.current.push(id);
    },
    [queue.length, reviews.length]
  );

  const playCardSound = useCallback(
    (wait: boolean = false) => {
      if (flipState === "answer") {
        setToolsLocked(true);
      }

      if (wait) {
        setTimeout(() => {
          // eslint-disable-next-line react-hooks/immutability
          playCardSound();
        }, 2000);

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
    [flipState, playSound, queue, reviewIndex, setActiveText, clearAllTimeouts]
  );

  const markForReview = useCallback(
    (item: (typeof quiz)[number]) => {
      if (reviews.find((rev) => rev.question === item.question)) return;

      setReviews((prev) => [...prev, item]);
    },
    [reviews]
  );

  const handleNext = useCallback(
    (review: boolean) => {
      const currentCard = queue[reviewIndex];

      if (review) {
        markForReview(currentCard);
      } else {
        setReviews((prev) =>
          prev.filter((rev) => rev.question !== currentCard.question)
        );
      }

      setFlipped(false);
      setFlipState("question");

      if (reviewIndex + 1 >= queue.length) {
        setWin(true);

        setReviewStarted(false);
        setReviewIndex(0);
      } else {
        // setReviewIndex((prev) => Math.min(prev + 1, queue.length - 1));
        setReviewIndex(Math.min(reviewIndex + 1, queue.length - 1));
      }
    },
    [queue, reviewIndex, markForReview]
  );

  const handleFlip = useCallback(() => {
    setFlipped(true);

    if (flipState === "question") {
      setFlipState("answer");
      setToolsLocked(true);
    } else {
      setFlipState("question");
    }
  }, [flipState]);

  useEffect(() => {
    if (!reviewStarted) return;

    playCardSound(flipState === "answer");
  }, [flipState, playCardSound, reviewStarted]);

  useEffect(() => {
    if (!win) return;

    if (reviews.length < queue.length) {
      if (reviews.length === 0) {
        scriptTimeoutsRef.current.push(
          setTimeout(() => {
            fireConfetti(false);
          }, 5000)
        );

        runScript(customScript.winAll);
      } else {
        // const score = queue.length - reviews.length;
        // const total = queue.length;

        // const modifiedScript = customScript.winSome.map((line) => {
        //   return {
        //     ...line,
        //     title: line.title
        //       .replace("$score$", score.toString())
        //       .replace("$total$", total.toString()),
        //   };
        // });

        // runScript(modifiedScript);

        runScript(customScript.winSome);
      }
    } else {
      // const score = queue.length - reviews.length;
      // const total = queue.length;

      // const modifiedScript = customScript.lostAll.map((line) => {
      //   return {
      //     ...line,
      //     title: line.title
      //       .replace("$score$", score.toString())
      //       .replace("$total$", total.toString()),
      //   };
      // });

      // runScript(modifiedScript);

      runScript(customScript.lostAll);

      playFilmStart();

      playPause();

      stopEntertainer();
      stopFilmRoll();

      setEntertainerStopped(true);

      scriptTimeoutsRef.current.push(
        setTimeout(() => {
          playSilence();
        }, 1700)
      );

      scriptTimeoutsRef.current.push(
        setTimeout(() => {
          playCry();
        }, 12200)
      );

      scriptTimeoutsRef.current.push(
        setTimeout(() => {
          playAngry();
        }, 14200)
      );
    }
  }, [
    win,
    fireConfetti,
    reviews,
    queue,
    playPause,
    playFilmStart,
    stopEntertainer,
    stopFilmRoll,
    playSilence,
    playCry,
    playAngry,
  ]);

  useEffect(() => {
    if (!siteEntered) return;
    if (!imagesPreloaded) return;

    playFilmStart();
    playFilmRoll();

    const timer = setTimeout(() => {
      setReviewStarted(true);
      setFirstLoad(false);

      playEntertainer();
    }, 3000);

    return () => {
      stopFilmRoll();
      stopEntertainer();

      clearAllTimeouts();

      clearTimeout(timer);
    };
  }, [
    siteEntered,
    imagesPreloaded,
    playFilmRoll,
    playFilmStart,
    playEntertainer,
    stopFilmRoll,
    stopEntertainer,
    clearAllTimeouts,
  ]);

  useEffect(() => {
    const preloadImages = async () => {
      const promises = quiz.map((item) => {
        return new Promise((resolve, reject) => {
          const img = new window.Image();

          const filename = item.answer.split(".")[0];
          img.src = `/level${level}/${filename}.old.gif`;

          img.onload = () => resolve(true);

          img.onerror = (error) => {
            console.warn(`Failed to preload image: ${filename}`, error);
            resolve(true);
          };
        });
      });

      await Promise.all(promises);
      setImagesPreloaded(true);
    };

    preloadImages();
  }, [level, quiz]);

  useEffect(() => {
    router.replace(`/level/${level}/flashcards/${flashcardsMode}`);
  }, [flashcardsMode, level, router]);

  return (
    <div className={clsx(styles.container, "animate-projector-jitter")}>
      <ProjectorOverlay />

      <div
        className={clsx(styles.frameCtn, activeText && styles.frameCtnActive)}
      >
        <Image
          src={"/frame-optimised.png"}
          alt={"frame"}
          width={200}
          height={200}
          className={styles.frame}
          priority={true}
        />

        <div className={styles.frameText}>
          {(activeText || "").toUpperCase()}
        </div>

        <div className={styles.actionTextTools}>
          <KeybindButton
            keybinds={[T_Keybind.escape]}
            onPress={() => {
              clearAllTimeouts();

              setActiveText(null);
              setToolsLocked(false);
            }}
            disabled={!activeText}
            forceTheme={"dark"}
          >
            Skip Text
          </KeybindButton>
        </div>
      </div>

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
            key={"reviewremaining"}
            className={styles.reviewTools}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              type: "spring",

              stiffness: 120,
              damping: 20,

              opacity: {
                duration: 0.2,
              },
            }}
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
              disabled={
                !!activeText ||
                toolsLocked ||
                reviewLoading ||
                exitReviewLoading ||
                reviewRemainingLoading
              }
              loadingText={"Please wait..."}
              loadingTextEnabled={true}
              icon={<ArrowLeft />}
            >
              Back
            </KeybindButton>

            {reviews.length > 0 && reviews.length < quiz.length && (
              <KeybindButton
                // keybinds={[T_Keybind.shift, T_Keybind.enter]}
                // keybinds={[T_Keybind.enter]}
                keybinds={[T_Keybind.r]}
                forceTheme={"dark"}
                onPress={() => {
                  const start = () => {
                    setQueue(reviews);
                    setReviews([]);

                    setWin(false);

                    // setFlipped(false);
                  };

                  if (entertainerStopped) {
                    setEntertainerStopped(false);

                    setReviewRemainingLoading(true);

                    playFilmStart();
                    playFilmRoll();

                    setTimeout(() => {
                      start();

                      playEntertainer();

                      setReviewRemainingLoading(false);

                      setReviewStarted(true);
                      setFirstLoad(false);
                    }, 3000);

                    return;
                  }

                  start();

                  setReviewStarted(true);
                  setReviewRemainingLoading(false);
                }}
                disabled={
                  !!activeText ||
                  toolsLocked ||
                  reviewLoading ||
                  exitReviewLoading ||
                  reviewRemainingLoading
                }
                loading={reviewRemainingLoading}
                loadingText={"Please wait..."}
                loadingTextEnabled={true}
                icon={<Flame />}
              >
                Review Remaining
              </KeybindButton>
            )}

            <KeybindButton
              keybinds={[T_Keybind.enter]}
              // keybinds={[T_Keybind.shift, T_Keybind.enter]}
              forceTheme={"dark"}
              onPress={() => {
                const start = () => {
                  setQueue(quiz);
                  setReviews([]);

                  setWin(false);
                };

                if (entertainerStopped) {
                  setEntertainerStopped(false);

                  setReviewLoading(true);

                  playFilmStart();
                  playFilmRoll();

                  setTimeout(() => {
                    start();

                    playEntertainer();

                    setReviewLoading(false);

                    setReviewStarted(true);
                    setFirstLoad(false);
                  }, 3000);

                  return;
                }

                start();

                setReviewStarted(true);
                setReviewLoading(false);
              }}
              disabled={
                !!activeText ||
                toolsLocked ||
                reviewLoading ||
                exitReviewLoading ||
                reviewRemainingLoading
              }
              loading={reviewLoading}
              loadingText={"Please wait..."}
              loadingTextEnabled={true}
              icon={<BookCopy />}
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
            transition={{
              type: "spring",

              stiffness: 120,
              damping: 20,

              opacity: {
                duration: 0.2,
              },
            }}
            key={"exitreview"}
          >
            <KeybindButton
              keybinds={[T_Keybind.shift, T_Keybind.escape]}
              onPress={() => {
                setReviewStarted(false);
                setFlipped(false);
                setFlipState("question");

                setReviewIndex(0);
              }}
              disabled={!!activeText || toolsLocked}
              forceTheme={"dark"}
              dangerous={true}
              icon={<X />}
            >
              End Review
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
                    unoptimized={true}
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
                    unoptimized={true}
                  />
                </>
              )}
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
                      "_blank"
                    );
                  }}
                  disabled={!!activeText || toolsLocked}
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
              >
                Play Sound
              </KeybindButton>

              <KeybindButton
                keybinds={[T_Keybind.space]}
                forceTheme={"dark"}
                key={"space"}
                onPress={() => {
                  handleFlip();
                }}
                disabled={!!activeText || toolsLocked}
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

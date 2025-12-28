"use client";

import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";

import Image from "next/image";
import Link from "next/link";

import { useRouter } from "next/navigation";

import {
  ArrowLeftIcon,
  BookCopy,
  Brain,
  ExternalLink,
  ListChecks,
  AudioLines,
  X,
} from "lucide-react";

import clsx from "clsx";
import useSound from "use-sound";

import { motion, AnimatePresence } from "motion/react";
import { DateTime } from "luxon";

import { calcImgSrc, capitalize } from "@/lib/utils";

import { useSettings } from "@/components/context/settings";
import { useGlobalMusic } from "@/components/context/music";
import { useLevel } from "@/components/context/level";

import { useConfetti } from "@/components/confetti";

import Selection from "@/components/lg/selection";

import Keybind, { KeybindButton, T_Keybind } from "@/components/keybind";

import styles from "./page.module.scss";

import { Z_GameMode, type T_GameMode } from "@/types";
import { Magnetic } from "@/components/mp/magnetic";

const leftKeys = [
  T_Keybind.q,
  T_Keybind.w,
  T_Keybind.e,
  T_Keybind.r,
  T_Keybind.t,
  T_Keybind.y,
  T_Keybind.u,
];

const rightKeys = [
  T_Keybind.one,
  T_Keybind.two,
  T_Keybind.three,
  T_Keybind.four,
  T_Keybind.five,
  T_Keybind.six,
  T_Keybind.seven,
];

// type T_Question = {
//   question: string;
//   answer: string;
//   voice: string;
// };

export default function Page() {
  const router = useRouter();

  const { setVolume, setOverride } = useGlobalMusic();
  const { trollModeEnabled, maxLevel, setMaxLevel, flashcardsMode } =
    useSettings();

  const { level, timer, quiz, playSound } = useLevel();
  const { fireConfetti } = useConfetti();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [returnLoading, setReturnLoading] = useState<boolean>(false);
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [answersVisible, setAnswersVisible] = useState<boolean>(false);

  const [selectedGameMode, setSelectedGameMode] =
    useState<T_GameMode>("picture matching");

  const [win, setWin] = useState<boolean>(false);
  const [lost, setLost] = useState<boolean>(false);

  const [stage, setStage] = useState<number>(1);

  const [selectedQuestion, setSelectedQuestion] = useState<string>("");

  const [answered, setAnswered] = useState<Array<string>>([]);
  const [currentTimer, setCurrentTimer] = useState<string>("infinite");

  const [playDing] = useSound("/ding.mp3", {
    volume: 0.5,
  });

  const [playAlert] = useSound("/alert.mp3", {
    volume: 0.5,
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

  const [playLeFishe, { stop: stopLeFishe }] = useSound("/lefishe.mp3", {
    volume: 1,
    interrupt: true,
    onplay: () => {
      setOverride(true);
    },
    onend: () => {
      setOverride(false);
    },
  });

  const playBen = useCallback(() => {
    const benSounds = [playBen1, playBen2, playBen3, playBen4, playBen5];
    const randomIndex = Math.floor(Math.random() * benSounds.length);

    benSounds[randomIndex]();
  }, [playBen1, playBen2, playBen3, playBen4, playBen5]);

  const startGame = useCallback(() => {
    setWin(false);
    setLost(false);

    setStage(1);

    setGameStarted(true);

    if (timer <= 0) return;

    const future = DateTime.now().plus({
      seconds: timer,
    });

    timerRef.current = setInterval(() => {
      if (!timerRef.current) return;

      if (DateTime.now() > future) {
        clearInterval(timerRef.current);
        timerRef.current = null;

        setLost(true);
        playAlert();

        return;
      }

      setCurrentTimer(future.diffNow().toFormat("mm:ss"));
    }, 500);
  }, [timer, playAlert]);

  const gameData = useMemo(() => {
    if (!quiz) return { questions: [], images: [] };

    const questions = [...quiz];
    const images = [...quiz];

    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    for (let i = images.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [images[i], images[j]] = [images[j], images[i]];
    }

    return { questions, images };
    //   Everytime stage is changed shuffle the gameData
    //   eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, stage]);

  const playCardSound = useCallback(
    (q: (typeof quiz)[number], tts: boolean = false) => {
      let fishPlayed = false;

      if (!tts) {
        setVolume(0.07);

        playSound(q.voice);
      } else {
        let matchedSwitch = false;

        if (trollModeEnabled) {
          switch (q.answer.split(".")[0]) {
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
        }

        if (!fishPlayed) {
          setVolume(0.07);
        }

        setTimeout(
          () => {
            let speech = q.answer.split(".")[0];

            if (!trollModeEnabled) {
              if (speech === "school bus") {
                speech = "elephant";
              } else if (speech === "chicken jocky") {
                speech = "chicken";
              }
            }

            const utterance = new SpeechSynthesisUtterance(speech);

            // utterance.pitch = 0.1;
            // utterance.rate = 0.1;
            // utterance.volume = 1;

            window.speechSynthesis.speak(utterance);
          },
          matchedSwitch ? 1000 : 0
        );
      }

      if (!fishPlayed) {
        setTimeout(() => {
          setVolume(0.5);
        }, 1000);
      }
    },
    [playSound, playBen, playLeFishe, setVolume, trollModeEnabled]
  );

  const handleAnswer = (q: (typeof quiz)[number]) => {
    if (selectedQuestion === q.question) {
      playDing();

      playCardSound(q, true);

      setSelectedQuestion("");

      const newAnswered = [...answered, q.question];

      setAnswered(newAnswered);

      if (newAnswered.length >= quiz.length) {
        if (stage < 5) {
          setAnswered([]);
          setStage((prev) => prev + 1);
        } else {
          setWin(true);

          setMaxLevel(maxLevel + 1);

          if (timerRef.current) {
            clearInterval(timerRef.current);
            setCurrentTimer("infinite");
          }

          fireConfetti(true);
        }
      }
    } else if (selectedQuestion !== "") {
      playAlert();
    }
  };

  useEffect(() => {
    if (!trollModeEnabled) {
      stopLeFishe();
      setOverride(false);
    }
  }, [trollModeEnabled, stopLeFishe, setOverride]);

  return (
    <div className={styles.container}>
      <div className={styles.levelInfoPage}>
        <AnimatePresence mode={"popLayout"}>
          {!gameStarted && (
            <motion.div
              key={"title-ctn-start"}
              className={styles.levelInfoCtn}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                type: "spring",

                stiffness: 120,
                damping: 20,

                opacity: {
                  duration: 0.2,
                  ease: "easeInOut",
                },
              }}
              data-enabled={answersVisible}
              layout
            >
              <div className={styles.levelInfoSection}>
                <h1 className={styles.levelTitle}>Level {level}</h1>

                <p className={styles.levelDesc}>
                  Timer:{" "}
                  {timer > 0
                    ? `${DateTime.fromSeconds(timer).toFormat("mm:ss")}`
                    : `no timer`}
                </p>

                {/* <div className={styles.gameMode}>
                  <span>Game Mode:</span>
                  <div className={styles.gameModeSelect}>
                    <Selection
                      value={selectedGameMode}
                      onSelect={(value) => {
                        setSelectedGameMode(value as T_GameMode);
                      }}
                    >
                      {Object.values(Z_GameMode.enum).map((mode) => (
                        <Selection.Item key={`gameMode-${mode}`} value={mode}>
                          {mode}
                        </Selection.Item>
                      ))}
                    </Selection>
                  </div>
                </div> */}
              </div>

              <div
                className={clsx(
                  styles.levelInfoSection,
                  styles.levelInfoOptions
                )}
              >
                <KeybindButton
                  forceTheme={"dark"}
                  keybinds={[T_Keybind.escape]}
                  onPress={() => {
                    setReturnLoading(true);

                    setTimeout(() => {
                      router.push(`/`);
                    }, 750);
                  }}
                  disabled={reviewLoading || returnLoading}
                  loading={returnLoading}
                  loadingText={"Please wait..."}
                  loadingTextEnabled={true}
                  dangerous={true}
                  icon={<ArrowLeftIcon />}
                >
                  Back
                </KeybindButton>

                <KeybindButton
                  forceTheme={"dark"}
                  keybinds={[T_Keybind.a]}
                  onPress={() => {
                    setAnswersVisible((prev) => !prev);
                  }}
                  disabled={reviewLoading || returnLoading}
                  icon={<ListChecks />}
                  layout
                >
                  {answersVisible ? "Hide Answers" : "Show Answers"}
                </KeybindButton>

                <KeybindButton
                  forceTheme={"dark"}
                  keybinds={[T_Keybind.f]}
                  onPress={() => {
                    setReviewLoading(true);

                    setTimeout(() => {
                      router.push(
                        `/level/${level}/flashcards/${flashcardsMode}`
                      );
                    }, 750);
                  }}
                  loading={reviewLoading}
                  disabled={reviewLoading || returnLoading}
                  loadingText={"Please wait..."}
                  loadingTextEnabled={true}
                  icon={<BookCopy />}
                  layout
                >
                  Flashcards
                </KeybindButton>

                <KeybindButton
                  forceTheme={"dark"}
                  keybinds={[T_Keybind.enter]}
                  onPress={() => {
                    startGame();
                  }}
                  disabled={reviewLoading || returnLoading}
                  loadingTextEnabled={false}
                  icon={<Brain />}
                  layout
                >
                  Start Level
                </KeybindButton>
              </div>
            </motion.div>
          )}

          {gameStarted && win && (
            <motion.div
              className={styles.levelInfoCtn}
              key={"title-ctn-win"}
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
              data-enabled={answersVisible}
              layout
            >
              <div className={styles.levelInfoSection}>
                <h1 className={styles.levelTitle}>
                  You completed Level {level}!
                </h1>
              </div>

              <div className={styles.levelInfoSection}>
                <motion.div
                  className={styles.toolrow}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  // layout
                >
                  <KeybindButton
                    forceTheme={"dark"}
                    keybinds={[T_Keybind.escape]}
                    onPress={() => {
                      setReturnLoading(true);

                      setTimeout(() => {
                        router.push(`/`);
                      }, 750);
                    }}
                    disabled={reviewLoading || returnLoading}
                    loading={returnLoading}
                    loadingText={"Please wait..."}
                    loadingTextEnabled={true}
                    reversed={false}
                    dangerous={true}
                    icon={<ArrowLeftIcon />}
                  >
                    Back
                  </KeybindButton>

                  <KeybindButton
                    forceTheme={"dark"}
                    keybinds={[T_Keybind.enter]}
                    onPress={() => {
                      startGame();
                    }}
                    disabled={returnLoading}
                    icon={<ListChecks />}
                  >
                    Play Again
                  </KeybindButton>
                </motion.div>
              </div>
            </motion.div>
          )}

          {gameStarted && lost && (
            <motion.div
              className={styles.levelInfoCtn}
              key={"title-ctn-lost"}
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
              data-enabled={answersVisible}
              layout
            >
              <div className={styles.levelInfoSection}>
                <h1 className={styles.levelTitle}>You failed Level {level}!</h1>
              </div>

              <div className={styles.levelInfoSection}>
                <motion.div
                  className={styles.toolrow}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <KeybindButton
                    forceTheme={"dark"}
                    keybinds={[T_Keybind.escape]}
                    onPress={() => {
                      setReturnLoading(true);

                      setTimeout(() => {
                        router.push(`/`);
                      }, 750);
                    }}
                    disabled={reviewLoading || returnLoading}
                    loading={returnLoading}
                    loadingText={"Please wait..."}
                    loadingTextEnabled={true}
                    reversed={false}
                    dangerous={true}
                    icon={<ArrowLeftIcon />}
                  >
                    Back
                  </KeybindButton>

                  <KeybindButton
                    forceTheme={"dark"}
                    keybinds={[T_Keybind.enter]}
                    onPress={() => {
                      startGame();
                    }}
                    disabled={returnLoading}
                    icon={<ListChecks />}
                  >
                    Retry
                  </KeybindButton>
                </motion.div>
              </div>
            </motion.div>
          )}

          {!gameStarted && answersVisible && (
            <motion.div
              className={styles.answersCtn}
              key={"answers-ctn"}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{
                type: "spring",

                stiffness: 120,
                damping: 20,

                opacity: {
                  duration: 0.2,
                },
              }}
            >
              <div className={styles.answersFrame}>
                {quiz.map((q) => (
                  <div key={`answer_${q.question}`} className={styles.answer}>
                    <Magnetic
                      // key={`answer_image_${q.question}`}
                      actionArea="global"
                      range={100}
                      intensity={0.1}
                      springOptions={{ bounce: 0.1 }}
                      className={styles.answerImageCtn}
                      action={() => {
                        playCardSound(q, true);
                      }}
                    >
                      <Image
                        key={`img_answer_${q.question}_${trollModeEnabled}`}
                        className={styles.answerImage}
                        src={`/level${level}/${
                          trollModeEnabled
                            ? q.answer
                            : `${q.answer.split(".")[0]}.${
                                q.answer.split(".")[
                                  q.answer.split(".").length - 1
                                ]
                              }`
                        }`}
                        alt={"answer image"}
                        width={200}
                        height={200}
                      />
                    </Magnetic>

                    <div className={styles.answerInfo}>
                      <div>
                        <h1 className={styles.answerTitle}>
                          <strong>{capitalize(q.realanswer)}</strong>
                        </h1>
                        <h2 className={styles.answerQuestion}>{q.question}</h2>
                      </div>

                      <div className={styles.answerActions}>
                        <Magnetic
                          intensity={0.1}
                          springOptions={{ bounce: 0.1 }}
                          actionArea="global"
                          range={75}
                          className={styles.actionButton}
                          action={() => {
                            playCardSound(q);
                          }}
                        >
                          <AudioLines className={styles.icon} />
                        </Magnetic>

                        <Link
                          href={`https://www.thai2english.com/?q=${encodeURIComponent(q.question)}`}
                          target={"_blank"}
                          className={styles.actionButton}
                        >
                          <Magnetic
                            intensity={0.1}
                            springOptions={{ bounce: 0.1 }}
                            actionArea="global"
                            range={75}
                            // className={styles.keybindContainerMagnet}
                          >
                            <ExternalLink className={styles.icon} />
                          </Magnetic>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode={"popLayout"}>
        {gameStarted && !win && !lost && (
          <motion.div
            key={`stageLabel-${stage}`}
            className={styles.stageLabel}
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
            layout
          >
            <div>Stage: {stage}/5</div>
            <div> Timer: {currentTimer}</div>
          </motion.div>
        )}

        {gameStarted && !win && !lost && (
          <motion.div
            key={`endSession`}
            className={styles.endSession}
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
            layout
          >
            <KeybindButton
              forceTheme={"dark"}
              keybinds={[T_Keybind.shift, T_Keybind.escape]}
              onPress={() => {
                setGameStarted(false);

                if (timerRef.current) {
                  clearInterval(timerRef.current);
                  setCurrentTimer("infinite");
                }
              }}
              loadingTextEnabled={false}
              dangerous={true}
              icon={<X />}
            >
              End Session
            </KeybindButton>
          </motion.div>
        )}

        {gameStarted && !win && !lost && (
          <motion.div
            key={`game-ctn-${stage}`}
            className={styles.gameCtn}
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
            layout
          >
            <div className={styles.gameFrame}>
              <div className={styles.column}>
                <AnimatePresence mode={"popLayout"}>
                  {gameData.questions
                    .filter((q) => !answered.includes(q.question))
                    .map((q, i) => (
                      <motion.div
                        key={`question_${q.question}`}
                        className={clsx(
                          styles.question,
                          selectedQuestion == q.question &&
                            styles.question_selected
                        )}
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        exit={{
                          opacity: 0,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 120,
                          damping: 20,
                          opacity: {
                            duration: 0.2,
                            ease: "easeInOut",
                          },
                        }}
                        onClick={() => {
                          playCardSound(q);
                          setSelectedQuestion(q.question);
                        }}
                        layout
                      >
                        {q.question}
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>

              <div className={styles.column}>
                <AnimatePresence mode={"popLayout"}>
                  {gameData.images
                    .filter((q) => !answered.includes(q.question))
                    .map((q, i) => (
                      <motion.div
                        key={`image_${q.question}`}
                        className={styles.imageCtn}
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        exit={{
                          opacity: 0,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 120,
                          damping: 20,

                          opacity: {
                            duration: 0.2,
                            ease: "easeInOut",
                          },
                        }}
                        onClick={() => handleAnswer(q)}
                        layout
                      >
                        <Image
                          draggable={false}
                          src={calcImgSrc(q.answer, {
                            level,
                            trollModeEnabled,
                          })}
                          alt={"answer image"}
                          width={200}
                          height={200}
                          className={styles.image}
                        />
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import React, {
  use,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import Image from "next/image";

import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "motion/react";
import { DateTime } from "luxon";
import { Howl } from "howler";
import clsx from "clsx";

import Keybind, { KeybindButton, T_Keybind } from "@/components/keybind";

import ReactCanvasConfetti from "react-canvas-confetti";
import type { TCanvasConfettiInstance } from "react-canvas-confetti/dist/types";

import styles from "./page.module.scss";
import levels from "@/components/levels.json";

import useSound from "use-sound";

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

type T_Question = {
  question: string;
  answer: string;
  voice: string;
};

export default function Page({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = use(params);

  const router = useRouter();

  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const [stage, setStage] = useState<number>(1);

  const [win, setWin] = useState<boolean>(false);

  const confettiRef = useRef<TCanvasConfettiInstance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [answered, setAnswered] = useState<Array<string>>([]);

  const voicesRef = useRef<{ [key: string]: Howl }>({});

  const myLevel:
    | {
        level: number;
        timer: number;
        quiz: { question: string; answer: string; voice: string }[];
      }
    | undefined = levels.find((lvl) => lvl.level === parseInt(level, 10));

  const [playDing] = useSound("/ding.mp3", {
    volume: 0.5,
  });

  const [playAlert] = useSound("/alert.mp3", {
    volume: 0.5,
  });
  const [playPop] = useSound("/pop.mp3", {
    volume: 5,
  });
  const [playBoop] = useSound("/boop.mp3", {
    volume: 0.5,
  });
  const [playSpeakCon] = useSound("/speakcon.mp3", {
    volume: 0.5,
  });
  const [playYay] = useSound("/yay.mp3", {
    volume: 0.5,
  });

  useEffect(() => {
    if (!myLevel) return;

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

  const fireWinConfetti = useCallback(() => {
    if (!confettiRef.current) return;

    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    const fire = (particleRatio: number, opts: any) => {
      confettiRef.current!({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    };

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  const playSound = (sound: string) => {
    const voice = voicesRef.current[sound];

    if (voice) {
      voice.play();
    }
  };

  const gameData = useMemo(() => {
    if (!myLevel?.quiz) return { questions: [], images: [] };

    const questions = [...myLevel.quiz];
    const images = [...myLevel.quiz];

    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    for (let i = images.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [images[i], images[j]] = [images[j], images[i]];
    }

    return { questions, images };
  }, [stage]);

  const handleAnswer = (q: T_Question) => {
    if (!myLevel) return;

    if (selectedQuestion === q.question) {
      playDing();

      const utterance = new SpeechSynthesisUtterance(q.answer.split(".")[0]);

      utterance.pitch = 0.1;
      utterance.rate = 0.1;
      utterance.volume = 1;

      window.speechSynthesis.speak(utterance);

      setSelectedQuestion("");

      const newAnswered = [...answered, q.question];

      setAnswered(newAnswered);

      if (newAnswered.length >= myLevel.quiz.length) {
        if (stage < 5) {
          setAnswered([]);
          setStage((prev) => prev + 1);
        } else {
          setWin(true);

          fireWinConfetti();
          playBoop();
          playPop();
          playSpeakCon();
          playYay();
        }
      }
    } else if (selectedQuestion !== "") {
      playAlert();
    }
  };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //
  //   }, 1000);
  //
  //   return () => clearInterval(interval);
  // }, []);

  if (!myLevel) {
    router.push("/");

    return null;
  }

  return (
    <div className={styles.container}>
      <ReactCanvasConfetti
        onInit={({ confetti }: { confetti: TCanvasConfettiInstance }) => {
          confettiRef.current = confetti;
        }}
        style={{
          position: "fixed",
          pointerEvents: "none",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          zIndex: 9999,
        }}
      />

      <AnimatePresence mode={"popLayout"}>
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

                const future = DateTime.now().plus({
                  seconds: myLevel.timer,
                });

                timerRef.current = setInterval(() => {
                  console.log(future.diffNow().toFormat("mm:ss"));
                }, 500);
              }}
              disabled={gameStarted}
              loadingTextEnabled={false}
            >
              Play
            </KeybindButton>
          </motion.div>
        )}

        {gameStarted && !win && (
          <motion.div
            className={styles.stageLabel}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            key={`stagelabel-${stage}`}
          >
            Stage: {stage}/5
          </motion.div>
        )}

        {gameStarted && win && (
          <motion.div
            className={styles.titleCtn}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            key={"title-ctn"}
          >
            <h1 className={styles.title}>You completed Level {level}!</h1>
            {/*  <p className={styles.desc}>*/}
            {/*    {myLevel.timer > 0*/}
            {/*      ? `*/}
            {/*Timer: ${DateTime.fromSeconds(myLevel.timer).toFormat("mm:ss")} minutes`*/}
            {/*      : `Timer: no timer`}*/}
            {/*  </p>*/}
          </motion.div>
        )}

        {gameStarted && win && (
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
              keybinds={[T_Keybind.enter]}
              onPress={() => {
                router.back();
              }}
              loadingTextEnabled={false}
            >
              Return
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
            <div className={styles.option}>
              <AnimatePresence mode={"popLayout"}>
                {gameData.questions
                  .filter((q) => !answered.includes(q.question))
                  .map((q, i) => (
                    <motion.div
                      key={`q_${q.question}`}
                      className={clsx(
                        styles.question,
                        selectedQuestion == q.question &&
                          styles.question_selected,
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
                      whileHover={{
                        scale: 1.01,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 20,
                        opacity: {
                          duration: 0.25,
                        },
                      }}
                      onClick={() => {
                        playSound(q.voice);
                        setSelectedQuestion(q.question);
                      }}
                      layout
                    >
                      {q.question}

                      <Keybind
                        keybinds={[leftKeys[i]]}
                        dangerous={false}
                        onPress={() => {
                          playSound(q.voice);
                          setSelectedQuestion(q.question);
                        }}
                        disabled={false}
                        loading={false}
                        loadingText={"loadingText"}
                        forcetheme={"dark"}
                      />
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>

            <div className={styles.option}>
              <AnimatePresence mode={"popLayout"}>
                {gameData.images
                  .filter((q) => !answered.includes(q.question))
                  .map((q, i) => (
                    <motion.div
                      key={`m_${q.question}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 20,
                        opacity: {
                          duration: 0.25,
                        },
                      }}
                      whileHover={{
                        scale: 1.01,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      layout
                      className={styles.imageCtn}
                      onClick={() => handleAnswer(q)}
                      // onClick={() => {
                      //   if (selectedQuestion === q.question) {
                      //     playDing();
                      //     setSelectedQuestion("");
                      //     setAnswered((prev) => [...prev, q.question]);
                      //   } else {
                      //     if (selectedQuestion !== "") playAlert();
                      //   }
                      // }}
                    >
                      <Keybind
                        keybinds={[rightKeys[i]]}
                        dangerous={false}
                        onPress={() => handleAnswer(q)}
                        // onPress={() => {
                        //   if (selectedQuestion === q.question) {
                        //     playDing();
                        //     setSelectedQuestion("");
                        //     setAnswered((prev) => [...prev, q.question]);
                        //   } else {
                        //     if (selectedQuestion !== "") playAlert();
                        //   }
                        // }}
                        parentClass={styles.keybindBtn}
                        disabled={false}
                        loading={false}
                        loadingText={"loadingText"}
                        forcetheme={"dark"}
                      />
                      <Image
                        src={`/level${level}/${q.answer}`}
                        alt={"answer image"}
                        width={200}
                        height={200}
                        className={styles.image}
                      />
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

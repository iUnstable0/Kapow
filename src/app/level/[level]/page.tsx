"use client";

import React, { use, useState, useRef, useEffect, useMemo } from "react";

import Image from "next/image";

import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "motion/react";
import { DateTime } from "luxon";
import { Howl } from "howler";
import clsx from "clsx";

import Keybind, { KeybindButton, T_Keybind } from "@/components/keybind";

import styles from "./page.module.scss";
import levels from "@/components/levels.json";

import useSound from "use-sound";

const MotionImage = motion.create(Image);

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

  const [answered, setAnswered] = useState<Array<string>>([]);

  const voicesRef = useRef<{ [key: string]: Howl }>({});

  const myLevel:
    | {
        level: number;
        timer: number;
        quiz: { question: string; answer: string; voice: string }[];
      }
    | undefined = levels.find((lvl) => lvl.level === parseInt(level, 10));

  useEffect(() => {
    if (!myLevel) {
      router.push("/");
    }
  }, [myLevel, router]);

  const [playDing] = useSound("/ding.mp3", {
    volume: 0.5,
  });

  const [playAlert] = useSound("/alert.mp3", {
    volume: 0.5,
  });

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

  useEffect(() => {
    if (!myLevel) return;

    if (answered.length >= myLevel.quiz.length) {
      setStage((prev) => prev + 1);
    }
  }, [answered, myLevel]);

  useEffect(() => {
    setAnswered([]);
  }, [stage]);

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

  if (!myLevel) return null;

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
            className={styles.stageLabel}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            key={`stagelabel-${stage}`}
          >
            Stage: {stage}
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
                  .map((q) => (
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
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>

            <div className={styles.option}>
              <AnimatePresence mode={"popLayout"}>
                {gameData.images
                  .filter((q) => !answered.includes(q.question))
                  .map((q) => (
                    <MotionImage
                      src={`/level${level}/${q.answer}`}
                      alt={"answer image"}
                      key={`m_${q.question}`}
                      width={200}
                      height={200}
                      className={styles.image}
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
                      onClick={() => {
                        if (selectedQuestion === q.question) {
                          playDing();
                          setAnswered((prev) => [...prev, q.question]);
                        } else {
                          playAlert();
                        }
                      }}
                    />
                  ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

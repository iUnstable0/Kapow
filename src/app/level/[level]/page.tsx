"use client";

import React, { useState, useRef, useMemo } from "react";

import Image from "next/image";

import { useRouter } from "next/navigation";

import clsx from "clsx";
import useSound from "use-sound";

import { motion, AnimatePresence } from "motion/react";
import { DateTime } from "luxon";

import { useLevel } from "@/components/level";
import { useConfetti } from "@/components/confetti";

import Keybind, { KeybindButton, T_Keybind } from "@/components/keybind";

import styles from "./page.module.scss";

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

export default function Page() {
  const router = useRouter();

  const { level, timer, quiz, playSound } = useLevel();
  const { fireConfetti } = useConfetti();

  const [returnLoading, setReturnLoading] = useState<boolean>(false);
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const [stage, setStage] = useState<number>(1);

  const [win, setWin] = useState<boolean>(false);
  const [lost, setLost] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [answered, setAnswered] = useState<Array<string>>([]);
  const [currentTimer, setCurrentTimer] = useState<string>("infinite");

  const [playDing] = useSound("/ding.mp3", {
    volume: 0.5,
  });

  const [playAlert] = useSound("/alert.mp3", {
    volume: 0.5,
  });

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

  const handleAnswer = (q: T_Question) => {
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

      if (newAnswered.length >= quiz.length) {
        if (stage < 5) {
          setAnswered([]);
          setStage((prev) => prev + 1);
        } else {
          setWin(true);

          fireConfetti(true);
        }
      }
    } else if (selectedQuestion !== "") {
      playAlert();
    }
  };

  return (
    <div className={styles.container}>
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
              {timer > 0
                ? `
          Timer: ${DateTime.fromSeconds(timer).toFormat("mm:ss")} minutes`
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
            <div className={styles.toolrowitm}>
              <KeybindButton
                forcetheme={"dark"}
                keybinds={[T_Keybind.escape]}
                onPress={() => {
                  setReturnLoading(true);

                  setTimeout(() => {
                    router.back();
                  }, 750);
                }}
                disabled={reviewLoading || returnLoading}
                loading={returnLoading}
                loadingText={"Please wait..."}
                loadingTextEnabled={true}
                reversed={true}
                dangerous={true}
              >
                Back
              </KeybindButton>
            </div>

            <div className={styles.toolrowitm}>
              <KeybindButton
                forcetheme={"dark"}
                keybinds={[T_Keybind.shift, T_Keybind.enter]}
                onPress={() => {
                  setReviewLoading(true);

                  setTimeout(() => {
                    router.push(`/level/${level}/review`);
                  }, 750);
                }}
                loading={reviewLoading}
                disabled={reviewLoading || returnLoading}
                loadingText={"Please wait..."}
                loadingTextEnabled={true}
              >
                Review
              </KeybindButton>

              <KeybindButton
                forcetheme={"dark"}
                keybinds={[T_Keybind.enter]}
                onPress={() => {
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

                      return;
                    }

                    setCurrentTimer(future.diffNow().toFormat("mm:ss"));
                  }, 500);
                }}
                disabled={reviewLoading || returnLoading}
                loadingTextEnabled={false}
              >
                Play
              </KeybindButton>
            </div>
          </motion.div>
        )}

        {gameStarted && !win && !lost && (
          <motion.div
            className={styles.stageLabel}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            key={`stagelabel-${stage}`}
          >
            <div>Stage: {stage}/5</div>
            <div> Timer: {currentTimer}</div>
            <KeybindButton
              keybinds={[T_Keybind.shift, T_Keybind.escape]}
              forcetheme={"dark"}
              onPress={() => {
                setGameStarted(false);

                if (timerRef.current) {
                  clearInterval(timerRef.current);
                  setCurrentTimer("infinite");
                }
              }}
              disabled={false}
              loading={false}
              loadingText={"Please wait..."}
              loadingTextEnabled={true}
              reversed={false}
              dangerous={true}
            >
              Quit
            </KeybindButton>
          </motion.div>
        )}

        {gameStarted && lost && (
          <motion.div
            className={styles.titleCtn}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            key={"title-ctn-win"}
          >
            <h1 className={styles.title}>You failed Level {level}!</h1>
            {/*  <p className={styles.desc}>*/}
            {/*    {timer > 0*/}
            {/*      ? `*/}
            {/*Timer: ${DateTime.fromSeconds(timer).toFormat("mm:ss")} minutes`*/}
            {/*      : `Timer: no timer`}*/}
            {/*  </p>*/}
          </motion.div>
        )}

        {gameStarted && lost && (
          <motion.div
            className={styles.toolrow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            key={"toolbar-lost"}
          >
            <KeybindButton
              forcetheme={"dark"}
              keybinds={[T_Keybind.enter]}
              onPress={() => {
                setReturnLoading(true);

                setTimeout(() => {
                  router.back();
                }, 750);
              }}
              loading={returnLoading}
              disabled={returnLoading}
              loadingText={"Please wait..."}
              loadingTextEnabled={true}
            >
              Return
            </KeybindButton>
          </motion.div>
        )}

        {gameStarted && win && (
          <motion.div
            className={styles.titleCtn}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            key={"title-ctn-win"}
          >
            <h1 className={styles.title}>You completed Level {level}!</h1>
            {/*  <p className={styles.desc}>*/}
            {/*    {timer > 0*/}
            {/*      ? `*/}
            {/*Timer: ${DateTime.fromSeconds(timer).toFormat("mm:ss")} minutes`*/}
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
            key={"toolbar-win"}
          >
            <KeybindButton
              forcetheme={"dark"}
              keybinds={[T_Keybind.enter]}
              onPress={() => {
                setReturnLoading(true);

                setTimeout(() => {
                  router.back();
                }, 750);
              }}
              loading={returnLoading}
              disabled={returnLoading}
              loadingText={"Please wait..."}
              loadingTextEnabled={true}
            >
              Return
            </KeybindButton>
          </motion.div>
        )}

        {gameStarted && !win && !lost && (
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

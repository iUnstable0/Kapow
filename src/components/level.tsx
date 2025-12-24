"use client";

import React, {
  ReactNode,
  useRef,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";

import { Howl } from "howler";

type T_LevelData = {
  level: number;
  timer: number;
  quiz: { question: string; answer: string; voice: string }[];
};

type T_LevelContext = LevelData & {
  playSound: (voiceFile: string) => void;
};

const LevelContext = createContext<T_LevelContext | null>(null);

export function LevelProvider({
  data,
  children,
}: {
  data: T_LevelData;
  children: ReactNode;
}) {
  const voicesRef = useRef<{ [key: string]: Howl }>({});

  useEffect(() => {
    const currentVoices = voicesRef.current;

    data.quiz.forEach((q) => {
      if (!currentVoices[q.voice]) {
        currentVoices[q.voice] = new Howl({
          src: [`/level${data.level}/${q.voice}`],
          volume: 0.7,
        });
      }
    });

    return () => {
      Object.values(currentVoices).forEach((sound) => sound.unload());

      voicesRef.current = {};
    };
  }, [data]);

  const playSound = useCallback((voiceFile: string) => {
    const voice = voicesRef.current[voiceFile];

    if (voice) {
      voice.play();
    }
  }, []);

  const value = { ...data, playSound };

  return (
    <LevelContext.Provider value={value}>{children}</LevelContext.Provider>
  );
}

export function useLevel() {
  const context = useContext(LevelContext);

  if (!context) {
    throw new Error("useLevel must be used within a LevelProvider");
  }

  return context;
}

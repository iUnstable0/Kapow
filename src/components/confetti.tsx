"use client";

import React, { useRef, useCallback, createContext, useContext } from "react";

import ReactCanvasConfetti from "react-canvas-confetti";
import type { TCanvasConfettiInstance } from "react-canvas-confetti/dist/types";

import useSound from "use-sound";

interface T_ConfettiContext {
  fireConfetti: (sound: boolean) => void;
}

const ConfettiContext = createContext<T_ConfettiContext | null>(null);

export function ConfettiProvider({ children }: { children: React.ReactNode }) {
  const confettiRef = useRef<TCanvasConfettiInstance | null>(null);

  const [playYay] = useSound("/yay.mp3", {
    volume: 0.5,
  });

  const [playBoop] = useSound("/boop.mp3", {
    volume: 0.5,
  });

  const [playPop] = useSound("/pop.mp3", {
    volume: 0.5,
  });

  const [playSpeakCon] = useSound("/speakcon.mp3", {
    volume: 0.5,
  });

  const fireConfetti = useCallback(
    (sound: boolean) => {
      if (!confettiRef.current) return;

      if (sound) {
        playBoop();
        playPop();
        playSpeakCon();
        playYay();
      }

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
    },
    [playBoop, playPop, playSpeakCon, playYay],
  );

  return (
    <ConfettiContext.Provider value={{ fireConfetti }}>
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

      {children}
    </ConfettiContext.Provider>
  );

  // return (
  //   <ReactCanvasConfetti
  //     onInit={({ confetti }: { confetti: TCanvasConfettiInstance }) => {
  //       confettiRef.current = confetti;
  //     }}
  //     style={{
  //       position: "fixed",
  //       pointerEvents: "none",
  //       width: "100%",
  //       height: "100%",
  //       top: 0,
  //       left: 0,
  //       zIndex: 9999,
  //     }}
  //   />
  // );
}

export function useConfetti() {
  const context = useContext(ConfettiContext);

  if (!context) {
    throw new Error("useConfetti must be used within a ConfettiProvider");
  }

  return context;
}

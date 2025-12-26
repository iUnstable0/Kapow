"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { Howl } from "howler";
import { AnimatePresence, motion } from "motion/react";

import styles from "./music.module.scss";

import { TextMorph } from "@/components/mp/text-morph";

// const adhd_songs = Array.from(
//   { length: 15 },
//   (_, i) => `/adhd/song ${i + 1}.mp3`,
// );

const coffee_songs = Array.from(
  { length: 10 },
  (_, i) => `/coffee/coffee ${i + 1}.mp3`,
);

const blueberry_songs = Array.from(
  { length: 13 },
  (_, i) => `/blueberry/blueberry ${i + 1}.mp3`,
);

const playlist = [...coffee_songs, ...blueberry_songs];
// const playlist = [...adhd_songs, ...blueberry_songs];

interface T_MusicContext {
  play: () => void;
  pause: () => void;
  stop: () => void;
  next: () => void;
  setVolume: (volume: number) => void;
  volume: number;
  isPlaying: boolean;
  isLoaded: boolean;
  toggle: () => void;
  currentTrack: string;
}

let hasUserInteractedGlobal = false;

const MusicContext = createContext<T_MusicContext | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const soundRef = useRef<Howl | null>(null);

  const handleNextRef = useRef<() => void>(() => {});

  // const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const volumeRef = useRef(0.5);
  const [volume, setVolumeState] = useState(0.5);

  const [queue, setQueue] = useState<string[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(0);

  const [siteEntered, setSiteEntered] = useState<boolean>(
    hasUserInteractedGlobal,
  );

  useEffect(() => {
    const newPlaylist = [...playlist];

    for (let i = newPlaylist.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newPlaylist[i], newPlaylist[j]] = [newPlaylist[j], newPlaylist[i]];
    }

    setQueue(newPlaylist);
    setQueueIndex(0);
  }, []);

  const handleNext = useCallback(() => {
    setQueueIndex((prevIndex) => {
      let nextIndex = prevIndex + 1;

      if (nextIndex >= queue.length) {
        nextIndex = 0;
      }

      return nextIndex;
    });
  }, [queue]);

  useEffect(() => {
    handleNextRef.current = handleNext;
  }, [handleNext]);

  const loadSong = useCallback((src: string) => {
    if (soundRef.current) {
      soundRef.current.unload();
    }

    soundRef.current = new Howl({
      src: [src],
      html5: true,
      volume: 0,
      autoplay: true,
      onload: () => setIsLoaded(true),
      onplay: () => {
        setIsPlaying(true);

        soundRef.current?.fade(0, volumeRef.current, 2000);
      },
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false),
      onend: () => {
        if (handleNextRef.current) {
          handleNextRef.current();
        }
      },
    });
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    // const v = Math.max(0, Math.min(1, newVolume));
    const v = newVolume;
    // muhehehe

    setVolumeState(v);
    volumeRef.current = v;

    const sound = soundRef.current;

    if (sound) {
      sound.off("fade");

      sound.fade(sound.volume(), v, 100);
    }
  }, []);

  useEffect(() => {
    if (queue.length > 0) {
      loadSong(queue[queueIndex]);
    }
  }, [queueIndex, queue, loadSong]);

  const play = () => {
    const sound = soundRef.current;

    if (!sound) {
      if (queue.length > 0) {
        loadSong(queue[queueIndex]);
      }

      return;
    }

    if (!sound.playing()) {
      sound.off("fade");

      sound.volume(0);
      sound.play();
      sound.fade(0, volumeRef.current, 2000);
    }
  };

  const pause = () => {
    const sound = soundRef.current;

    if (!sound || !sound.playing()) return;

    sound.off("fade");

    const currentVol = sound.volume();
    sound.fade(currentVol, 0, 1000);

    sound.once("fade", () => {
      sound.pause();
      sound.volume(volumeRef.current);
    });
  };

  const stop = () => {
    const sound = soundRef.current;

    if (!sound || !sound.playing()) {
      setIsPlaying(false);
      return;
    }

    sound.off("fade");

    const currentVol = sound.volume();
    sound.fade(currentVol, 0, 1000);

    sound.once("fade", () => {
      sound.stop();
      setIsPlaying(false);
      sound.volume(volumeRef.current);
    });
  };

  const next = () => handleNext();

  const toggle = () => {
    if (soundRef.current?.playing()) pause();
    else play();
  };

  return (
    <MusicContext.Provider
      value={{
        play,
        pause,
        stop,
        next,
        setVolume,
        volume,
        isPlaying,
        isLoaded,
        toggle,
        currentTrack: queue[queueIndex],
      }}
    >
      <AnimatePresence mode="wait">
        {!siteEntered && (
          <motion.div
            key="welcome"
            className={styles.welcome}
            initial={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(12px)" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            onClick={() => {
              if (!isLoaded) return;

              if (!siteEntered) {
                setSiteEntered(true);

                hasUserInteractedGlobal = true;

                play();

                // playMain();
              }
            }}
          >
            <h1 className={styles.welcomeTitle}>Welcome!</h1>
            <div className={styles.welcomeMessage}>
              <TextMorph>
                {isLoaded
                  ? "Click anywhere to start!"
                  : "Loading, please wait..."}
              </TextMorph>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </MusicContext.Provider>
  );
}

export function useGlobalMusic() {
  const context = useContext(MusicContext);

  if (!context) {
    throw new Error("useGlobalMusic must be used within an MusicContext");
  }

  return context;
}

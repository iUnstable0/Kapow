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

import { shuffleArray } from "@/lib/utils";

import { useSettings } from "@/components/context/settings";

import { TextMorph } from "@/components/mp/text-morph";

import styles from "./music.module.scss";

import type { T_Playlist } from "@/types";

const adhd_songs = Array.from(
  { length: 15 },
  (_, i) => `/adhd/song ${i + 1}.mp3`,
);

const coffee_songs = Array.from(
  { length: 10 },
  (_, i) => `/coffee/coffee ${i + 1}.mp3`,
);

const blueberry_songs = Array.from(
  { length: 13 },
  (_, i) => `/blueberry/blueberry ${i + 1}.mp3`,
);

const cisco_songs = Array.from(
  { length: 1 },
  (_, i) => `/cisco/cisco ${i + 1}.mp3`,
);

const playlists: Record<T_Playlist, string[]> = {
  hiphop: adhd_songs,
  coffee: coffee_songs,
  blueberry: blueberry_songs,
  cisco: cisco_songs,
  all: [...adhd_songs, ...coffee_songs, ...blueberry_songs, ...cisco_songs],
};

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

  const { musicEnabled, selectedPlaylist } = useSettings();

  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const volumeRef = useRef(0.5);
  const [volume, setVolumeState] = useState(0.5);

  const [queue, setQueue] = useState<string[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(0);

  const [siteEntered, setSiteEntered] = useState<boolean>(
    hasUserInteractedGlobal,
  );

  const handleNext = useCallback(() => {
    setQueueIndex((prevIndex) => {
      let nextIndex = prevIndex + 1;

      if (nextIndex >= queue.length) {
        nextIndex = 0;
      }

      return nextIndex;
    });
  }, [queue]);

  const loadSong = useCallback(
    (src: string) => {
      if (soundRef.current) {
        soundRef.current.unload();
      }

      if (!musicEnabled) {
        setIsLoaded(true);

        return;
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
    },
    [musicEnabled],
  );

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

  useEffect(() => {
    setQueue(shuffleArray(playlists[selectedPlaylist]));
    setQueueIndex(0);
  }, [selectedPlaylist]);

  useEffect(() => {
    handleNextRef.current = handleNext;
  }, [handleNext]);

  useEffect(() => {
    if (queue.length > 0) {
      loadSong(queue[queueIndex]);
    }
  }, [queueIndex, queue, loadSong]);

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

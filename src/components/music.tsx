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

// const adhd_songs = Array.from(
//   { length: 15 },
//   (_, i) => `/adhd/song ${i + 1}.mp3`,
// );

const blueberry_songs = Array.from(
  { length: 26 },
  (_, i) => `/blueberry/blueberry ${i + 1}.mp3`,
);

const playlist = [...blueberry_songs];
// const playlist = [...adhd_songs, ...blueberry_songs];

interface T_MusicContext {
  play: () => void;
  pause: () => void;
  stop: () => void;
  next: () => void;
  isPlaying: boolean;
  isLoaded: boolean;
  toggle: () => void;
  currentTrack: string;
}

const MusicContext = createContext<T_MusicContext | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const soundRef = useRef<Howl | null>(null);

  const handleNextRef = useRef<() => void>(() => {});

  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [queue, setQueue] = useState<string[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(0);

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
      volume: 0.5,
      autoplay: true,
      onload: () => setIsLoaded(true),
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false),
      onend: () => {
        if (handleNextRef.current) {
          handleNextRef.current();
        }
      },
    });
  }, []);

  useEffect(() => {
    if (queue.length > 0) {
      loadSong(queue[queueIndex]);
    }
  }, [queueIndex, queue, loadSong]);

  const play = () => {
    if (!soundRef.current) {
      if (queue.length > 0) {
        loadSong(queue[queueIndex]);
      }
    } else if (!soundRef.current.playing()) {
      soundRef.current.play();
    }
  };

  const pause = () => soundRef.current?.pause();

  const stop = () => {
    soundRef.current?.stop();
    setIsPlaying(false);
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
        isPlaying,
        isLoaded,
        toggle,
        currentTrack: queue[queueIndex],
      }}
    >
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

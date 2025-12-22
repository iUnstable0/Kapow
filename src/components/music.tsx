"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import { Howl } from "howler";

const adhd_songs = Array.from(
  { length: 15 },
  (_, i) => `/adhd/song ${i + 1}.mp3`,
);

const blueberry_songs = Array.from(
  { length: 26 },
  (_, i) => `/blueberry/blueberry ${i + 1}.mp3`,
);

const playlist = [...adhd_songs, ...blueberry_songs];

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const soundRef = useRef<Howl | null>(null);
}

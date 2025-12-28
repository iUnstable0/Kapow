"use client";

import React, { useState, createContext, useContext, useEffect } from "react";

// import * as z from "zod";

import {
  Z_MaxLevel,
  Z_PlaylistEnum,
  type T_Playlist,
  Z_FlashcardsMode,
  type T_FlashcardsMode,
} from "@/types";

interface T_SettingsContext {
  trollModeEnabled: boolean;
  setTrollModeEnabled: (enabled: boolean) => void;

  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;

  maxLevel: number;
  setMaxLevel: (level: number) => void;

  selectedPlaylist: T_Playlist;
  setSelectedPlaylist: (playlist: T_Playlist) => void;

  flashcardsMode: T_FlashcardsMode;
  setFlashcardsMode: (mode: T_FlashcardsMode) => void;
}

const SettingsContext = createContext<T_SettingsContext | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [trollModeEnabled, setTrollModeEnabled] = useState<boolean>(false);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(false);

  const [maxLevel, setMaxLevel] = useState<number>(1);

  const [selectedPlaylist, setSelectedPlaylist] = useState<T_Playlist>("cisco");
  const [flashcardsMode, setFlashcardsMode] = useState<T_FlashcardsMode>("new");

  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    let trollMode = localStorage.getItem("trollMode");
    let music = localStorage.getItem("music");

    let maxLevel = localStorage.getItem("maxLevel");

    let selectedPlaylist = localStorage.getItem("selectedPlaylist");
    let flashcardsMode = localStorage.getItem("flashcardsMode");

    if (trollMode === null) {
      localStorage.setItem("trollMode", "true");
      trollMode = "true";
    }

    if (music === null) {
      localStorage.setItem("music", "true");
      music = "true";
    }

    if (maxLevel === null || !Z_MaxLevel.safeParse(maxLevel).success) {
      localStorage.setItem("maxLevel", "1");
      maxLevel = "1";
    }

    if (
      selectedPlaylist === null ||
      !Z_PlaylistEnum.safeParse(selectedPlaylist).success
    ) {
      localStorage.setItem("selectedPlaylist", "cisco");
      selectedPlaylist = "cisco" as T_Playlist;
    }

    if (
      flashcardsMode === null ||
      !Z_FlashcardsMode.safeParse(selectedPlaylist).success
    ) {
      localStorage.setItem("flashcardsMode", "new");
      flashcardsMode = "new" as T_FlashcardsMode;
    }

    setTrollModeEnabled(trollMode === "true");
    setMusicEnabled(music === "true");

    setMaxLevel(parseInt(maxLevel));

    setSelectedPlaylist(selectedPlaylist as T_Playlist);
    setFlashcardsMode(flashcardsMode as T_FlashcardsMode);

    setMounted(true);
  }, []);

  const handleTrollModeChange = (enabled: boolean) => {
    localStorage.setItem("trollMode", enabled ? "true" : "false");

    setTrollModeEnabled(enabled);
  };

  const handleMusicChange = (enabled: boolean) => {
    localStorage.setItem("music", enabled ? "true" : "false");

    setMusicEnabled(enabled);
  };

  const handleMaxLevelChange = (level: number) => {
    if (!Z_MaxLevel.safeParse(level).success) return;

    localStorage.setItem("maxLevel", level.toString());

    setMaxLevel(level);
  };

  const handlePlaylistChange = (playlist: T_Playlist) => {
    localStorage.setItem("selectedPlaylist", playlist);

    setSelectedPlaylist(playlist);
  };

  const handleFlashcardsModeChange = (playlist: T_FlashcardsMode) => {
    localStorage.setItem("flashcardsMode", playlist);

    setFlashcardsMode(playlist);
  };

  if (!mounted) {
    return null;
  }

  return (
    <SettingsContext.Provider
      value={{
        trollModeEnabled,
        setTrollModeEnabled: handleTrollModeChange,

        musicEnabled,
        setMusicEnabled: handleMusicChange,

        maxLevel,
        setMaxLevel: handleMaxLevelChange,

        selectedPlaylist,
        setSelectedPlaylist: handlePlaylistChange,

        flashcardsMode,
        setFlashcardsMode: handleFlashcardsModeChange,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error(
      "useSettings must be used within a SettingsContext provider",
    );
  }

  return context;
}

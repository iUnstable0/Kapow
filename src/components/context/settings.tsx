"use client";

import React, { useState, createContext, useContext, useEffect } from "react";

// import * as z from "zod";

import { Z_PlaylistEnum, Z_MaxLevel, type T_Playlist } from "@/types";

interface T_SettingsContext {
  trollModeEnabled: boolean;
  musicEnabled: boolean;
  maxLevel: number;
  selectedPlaylist: T_Playlist;

  setTrollModeEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setMaxLevel: (level: number) => void;
  setSelectedPlaylist: (playlist: T_Playlist) => void;
}

const SettingsContext = createContext<T_SettingsContext | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [trollModeEnabledState, setTrollModeEnabled] = useState<boolean>(false);
  const [musicEnabledState, setMusicEnabled] = useState<boolean>(false);

  const [maxLevel, setMaxLevel] = useState<number>(1);

  const [selectedPlaylist, setSelectedPlaylist] = useState<T_Playlist>("cisco");

  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    let trollMode = localStorage.getItem("trollMode");
    let music = localStorage.getItem("music");
    let maxLevel = localStorage.getItem("maxLevel");
    let selectedPlaylist = localStorage.getItem("selectedPlaylist");

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

    setTrollModeEnabled(trollMode === "true");
    setMusicEnabled(music === "true");
    setMaxLevel(parseInt(maxLevel));
    setSelectedPlaylist(selectedPlaylist as T_Playlist);

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

  if (!mounted) {
    return null;
  }

  return (
    <SettingsContext.Provider
      value={{
        trollModeEnabled: trollModeEnabledState,
        musicEnabled: musicEnabledState,
        maxLevel: maxLevel,
        selectedPlaylist: selectedPlaylist,

        setTrollModeEnabled: handleTrollModeChange,
        setMusicEnabled: handleMusicChange,
        setMaxLevel: handleMaxLevelChange,
        setSelectedPlaylist: handlePlaylistChange,
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

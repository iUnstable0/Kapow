"use client";

import React, { useState, createContext, useContext, useEffect } from "react";

import * as z from "zod";

import { PlaylistEnum, type T_Playlist } from "@/types";

interface T_SettingsContext {
  trollModeEnabled: boolean;
  musicEnabled: boolean;
  selectedPlaylist: T_Playlist;

  setTrollModeEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setSelectedPlaylist: (playlist: T_Playlist) => void;
}

const SettingsContext = createContext<T_SettingsContext | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [trollModeEnabledState, setTrollModeEnabled] = useState<boolean>(false);
  const [musicEnabledState, setMusicEnabled] = useState<boolean>(false);

  const [selectedPlaylist, setSelectedPlaylist] = useState<T_Playlist>("cisco");

  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    let trollMode = localStorage.getItem("trollMode");
    let music = localStorage.getItem("music");
    let selectedPlaylist = localStorage.getItem("selectedPlaylist");

    if (trollMode === null) {
      localStorage.setItem("trollMode", "true");
      trollMode = "true";
    }

    if (music === null) {
      localStorage.setItem("music", "true");
      music = "true";
    }

    if (
      selectedPlaylist === null ||
      !PlaylistEnum.safeParse(selectedPlaylist).success
    ) {
      localStorage.setItem("selectedPlaylist", "cisco");
      selectedPlaylist = "cisco" as T_Playlist;
    }

    setTrollModeEnabled(trollMode === "true");
    setMusicEnabled(music === "true");
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
        selectedPlaylist: selectedPlaylist,

        setTrollModeEnabled: handleTrollModeChange,
        setMusicEnabled: handleMusicChange,
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

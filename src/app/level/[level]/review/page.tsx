"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import Image from "next/image";

import { useRouter } from "next/navigation";

import clsx from "clsx";

import { motion, AnimatePresence } from "motion/react";
import { Howl } from "howler";

import { useLevel } from "@/components/level";

import Keybind, { KeybindButton, T_Keybind } from "@/components/keybind";

export default function Page() {
  const { level, timer, quiz, playSound } = useLevel();

  return <div>hello</div>;
}

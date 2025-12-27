"use client";

import React from "react";

import clsx from "clsx";

import styles from "./spinner.module.scss";

export default function Spinner({
  loading = true,
  size = 24,
  className,
  forceTheme,
  forceColor,
  dangerous,
  style,
  speedMultiplier = 1,
  preload = true,
}: {
  loading: boolean;
  size: number;
  className?: string;
  forceTheme?: "light" | "dark";
  forceColor?: string;
  dangerous?: boolean;
  style?: React.CSSProperties;
  speedMultiplier?: number;
  preload?: boolean;
}) {
  if (!loading && !preload) return null;

  let color = dangerous ? "--sp-dangerous-color" : "--sp-text-color";

  // if (!forceColor && forceTheme) color = `${color}-${forceTheme}`;

  if (!forceColor && forceTheme) {
    color = `${color}-${forceTheme}`;
  }

  // if (forceColor) color = forceColor;

  if (forceColor) {
    color = forceColor;
  }

  const customStyles = {
    "--spinner-size": `${size}px`,
    "--spinner-color": `var(${color})`,
    "--speed": `${2 / speedMultiplier}s`,
    ...style,
  };

  return (
    <span
      className={clsx(
        styles.spinner,
        loading && styles.spinner_loading,
        className,
      )}
      style={customStyles}
    >
      <span className={clsx(styles.spinner_animation, styles.before)} />
      <span className={clsx(styles.spinner_animation, styles.after)} />
    </span>
  );
}

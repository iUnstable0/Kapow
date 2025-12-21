"use client";

import clsx from "clsx";
import tinycolor from "tinycolor2";

import styles from "./spinner.module.scss";

export default function Spinner({
  id,
  loading = true,
  size = 24,
  className,
  style,
  speedMultiplier = 1,
  preload = true,
}: {
  id: string;
  loading: boolean;
  size: number;
  className?: React.CSSProperties;
  style?: React.CSSProperties;
  speedMultiplier?: number;
  preload?: boolean;
}) {
  const color = "#e2e2e2";

  const thickness = size / 5;

  const lat = (size - thickness) / 2;

  const offset = lat - thickness;

  const dimmedColor = tinycolor(color).setAlpha(0.75).toRgbString();

  const animation = `
@keyframes spinner-${id}-before {
0% {width: ${thickness}px; box-shadow: ${lat}px ${-offset}px ${dimmedColor}, ${-lat}px ${offset}px ${dimmedColor}}
35% {width: ${size}px; box-shadow: 0 ${-offset}px ${dimmedColor}, 0 ${offset}px ${dimmedColor}}
70% {width: ${thickness}px; box-shadow: ${-lat}px ${-offset}px ${dimmedColor}, ${lat}px ${offset}px ${dimmedColor}}
100% {box-shadow: ${lat}px ${-offset}px ${dimmedColor}, ${-lat}px ${offset}px ${dimmedColor}}
}

@keyframes spinner-${id}-after {
0% {height: ${thickness}px; box-shadow: ${offset}px ${lat}px ${color}, ${-offset}px ${-lat}px ${color}}
35% {height: ${size}px; box-shadow: ${offset}px 0 ${color}, ${-offset}px 0 ${color}}
70% {height: ${thickness}px; box-shadow: ${offset}px ${-lat}px ${color}, ${-offset}px ${lat}px ${color}}
100% {box-shadow: ${offset}px ${lat}px ${color}, ${-offset}px ${-lat}px ${color}}
}
  `;

  const newClassName = {
    width: `${size}px`,
    height: `${size}px`,
    ...(style ? style : {}),
  };

  const spinnerBefore = {
    width: `${size / 5}px`,
    height: `${size / 5}px`,
    borderRadius: `${size / 10}px`,
    animation: `spinner-${id}-before ${2 / speedMultiplier}s infinite`,
  };

  const spinnerAfter = {
    width: `${size / 5}px`,
    height: `${size / 5}px`,
    borderRadius: `${size / 10}px`,
    animation: `spinner-${id}-after ${2 / speedMultiplier}s infinite`,
  };

  if (!loading && !preload) {
    return null;
  }

  return (
    <span
      className={clsx(
        styles.spinner,
        className,
        loading && styles.spinner_loading,
      )}
      style={newClassName}
    >
      <style>{animation}</style>
      <span className={styles.spinner_animation} style={spinnerBefore} />
      <span className={styles.spinner_animation} style={spinnerAfter} />
    </span>
  );
}

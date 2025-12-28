import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffledArray = array.slice();

  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }

  return shuffledArray;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function calcImgSrc(answer: string, opt: { old?: boolean, trollModeEnabled?: boolean, level: number }): string {
  const prefix = `/level${opt.level}/`;

  if (opt?.trollModeEnabled) {
    return `${prefix}${answer}`;
  }

  const srcSplit = answer.split(".");

  if (opt?.old) {
    return `${prefix}${srcSplit[0]}.old.gif`;
  }

  return `${prefix}${srcSplit[0]}.${srcSplit[srcSplit.length - 1]}`;
}
import React from "react";

import { redirect } from "next/navigation";

import levels from "@/components/levels.json";

import { LevelProvider } from "@/components/level";
import { ConfettiProvider } from "@/components/confetti";

export default async function LevelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;

  const myLevel = levels.find((lvl) => lvl.level === parseInt(level, 10));

  if (!myLevel) {
    redirect("/");
  }

  return (
    <ConfettiProvider>
      <LevelProvider data={myLevel}>{children}</LevelProvider>{" "}
    </ConfettiProvider>
  );
}

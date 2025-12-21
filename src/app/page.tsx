"use client";

import React, { useState } from "react";

import Image from "next/image";

import styles from "./page.module.scss";

import { SlidingNumber } from "@/components/mp/sliding-number";

import levels from "@/components/levels.json";

export default function Home() {
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>welcome to kapow</h1>

          <div className={styles.levels}>
            <div className={styles.controls}>
              <button className={styles.select}>{"<"}</button>
              <button className={styles.select}>{">"}</button>
            </div>
            <Image
              src={`/${selectedLevel}.jpg`}
              alt={"food"}
              width={400}
              height={400}
              className={styles.kapow}
            />
          </div>
        </div>

        <SlidingNumber value={selectedLevel} />

        {/*<div>*/}
        {/*  <h1>Choose your level:</h1>*/}

        {/*  <select>*/}
        {/*    {levels.map((level) => (*/}
        {/*      <option value={level.level} key={level.level}>*/}
        {/*        {level.level}*/}
        {/*      </option>*/}
        {/*    ))}*/}
        {/*  </select>*/}

        {/*  <br />*/}

        {/*  <button>Start!</button>*/}
        {/*</div>*/}
      </div>
    </div>
  );
}

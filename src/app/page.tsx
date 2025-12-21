import Image from "next/image";

import styles from "./page.module.scss";

import levels from "@/components/levels.json";

export default function Home() {
  return (
    <div>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>welcome to kapow</h1>

          <Image
            src={"/1.jpg"}
            alt={"food"}
            width={400}
            height={400}
            className={styles.kapow}
          />
        </div>

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

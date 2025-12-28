import { useEffect, useState } from "react";

import styles from "./projector.module.scss";

const HairVariantA = () => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    className="opacity-80 drop-shadow-sm"
  >
    <path
      d="M40 10 C 60 40, 20 60, 50 90"
      stroke="rgba(255, 255, 255, 0.85)"
      strokeWidth="1.5"
      strokeLinecap="round"
      filter="url(#blurHair)"
    />
  </svg>
);

const HairVariantB = () => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    className="opacity-80 drop-shadow-sm"
  >
    <path
      d="M50 20 Q 55 50, 30 60"
      stroke="rgba(255, 255, 255, 0.85)"
      strokeWidth="2"
      strokeLinecap="round"
      filter="url(#blurHair)"
    />
  </svg>
);

const HairVariantC = () => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    className="opacity-70 drop-shadow-sm"
  >
    <path
      d="M30 30 C 50 30, 40 50, 60 50 C 50 70, 70 60, 40 80"
      stroke="rgba(255, 255, 255, 0.85)"
      strokeWidth="1"
      strokeLinecap="round"
      filter="url(#blurHair)"
    />
  </svg>
);

interface Hair {
  id: number;
  variant: number;
  top: string;
  left: string;
  rotation: string;
  scale: number;
  delay: string;
  animation: string;
}

const VintageProjector = () => {
  const [hairs, setHairs] = useState<Hair[]>([]);

  useEffect(() => {
    const hairCount = 6;

    const newHairs = Array.from({ length: hairCount }).map((_, i) => ({
      id: i,
      variant: Math.floor(Math.random() * 3), // 0, 1, or 2
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 80 + 10}%`,
      rotation: `${Math.random() * 360}deg`,
      scale: 0.8 + Math.random() * 0.5,
      delay: `${Math.random() * 8}s`,
      animation:
        Math.random() > 0.6 ? "animate-dust-fast" : "animate-dust-slow",
    }));

    setHairs(newHairs);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden rounded-lg">
      <div className={styles.filmLayer}>
        <div className={styles.effectLayer}>
          <div className={styles.grainLayer}></div>
        </div>
      </div>

      <div className="absolute inset-0 animate-projector-jitter">
        <svg className="absolute w-0 h-0">
          <defs>
            <filter id="blurHair">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" />
            </filter>
          </defs>
        </svg>

        {hairs.map((h) => (
          <div
            key={h.id}
            className={`absolute ${h.animation}`}
            style={{
              top: h.top,
              left: h.left,
              transform: `rotate(${h.rotation}) scale(${h.scale})`,
              animationDelay: h.delay,
            }}
          >
            {h.variant === 0 && <HairVariantA />}
            {h.variant === 1 && <HairVariantB />}
            {h.variant === 2 && <HairVariantC />}
          </div>
        ))}
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, transparent 55%, rgba(0,0,0,0.9) 150%)",
        }}
      />
    </div>
  );
};

export default VintageProjector;

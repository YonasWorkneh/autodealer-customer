"use client";

import { useEffect, useState } from "react";
import LogoLoader from "./LogoLoader";

const DRAW_MS = 6000;  // keep in sync with `draw Xs` in globals.css
const HOLD_MS = 800;   // pause after animation before fading
const FADE_MS = 1000;  // fade-out duration

// Resets on every full page load; survives client-side navigation
let introPlayed = false;

export default function IntroLoader({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"show" | "fading" | "done">("show");

  useEffect(() => {
    if (introPlayed) {
      setPhase("done");
      return;
    }
    introPlayed = true;

    const t1 = setTimeout(() => setPhase("fading"), DRAW_MS + HOLD_MS);
    const t2 = setTimeout(() => setPhase("done"), DRAW_MS + HOLD_MS + FADE_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <>
      {children}
      {phase !== "done" && (
        <div
          className="fixed inset-0 z-[9999] bg-background flex items-center justify-center"
          style={{
            opacity: phase === "fading" ? 0 : 1,
            transition: `opacity ${FADE_MS}ms ease`,
            pointerEvents: phase === "fading" ? "none" : "auto",
          }}
        >
          <LogoLoader className="w-72 h-72 animate-draw" />
        </div>
      )}
    </>
  );
}

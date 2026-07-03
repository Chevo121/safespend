"use client";

import { useEffect, useRef, useState } from "react";
import { currency } from "@/lib/calculations";

// Tweens the displayed value toward `value` whenever it changes, so the hero
// number visibly settles after clarifications update it.
export function AnimatedCurrency({
  value,
  className
}: {
  value: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const frameRef = useRef<number | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setDisplay(value);
      fromRef.current = value;
      return;
    }

    const from = fromRef.current;
    const to = value;
    if (from === to) {
      return;
    }

    const duration = 550;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (to - from) * eased;
      setDisplay(current);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      fromRef.current = value;
    };
  }, [value]);

  return <span className={className}>{currency.format(Math.round(display))}</span>;
}

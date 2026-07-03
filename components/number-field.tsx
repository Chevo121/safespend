"use client";

import { useEffect, useRef, useState } from "react";

// A numeric input that keeps its own text state, so clearing it leaves an
// empty field (instead of a stuck "0") and typing over it works naturally.
// It still reports a clean number to the parent.
export function NumberField({
  value,
  onChange,
  allowDecimal = true,
  max,
  ariaLabel,
  placeholder,
  className
}: {
  value: number;
  onChange: (value: number) => void;
  allowDecimal?: boolean;
  max?: number;
  ariaLabel?: string;
  placeholder?: string;
  className?: string;
}) {
  const [text, setText] = useState(() => (value ? String(value) : ""));
  const lastEmitted = useRef(value);

  // Reseed only when the value changes from outside this field (e.g. a reset
  // or loading a record to edit), never from our own onChange.
  useEffect(() => {
    if (value !== lastEmitted.current) {
      setText(value ? String(value) : "");
      lastEmitted.current = value;
    }
  }, [value]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    const pattern = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
    if (!pattern.test(raw)) {
      return;
    }

    let next = raw === "" || raw === "." ? 0 : Number(raw);
    if (max !== undefined && next > max) {
      next = max;
      setText(String(max));
    } else {
      setText(raw);
    }

    lastEmitted.current = next;
    onChange(next);
  }

  return (
    <input
      type="text"
      inputMode={allowDecimal ? "decimal" : "numeric"}
      value={text}
      onChange={handleChange}
      aria-label={ariaLabel}
      placeholder={placeholder}
      className={className}
    />
  );
}

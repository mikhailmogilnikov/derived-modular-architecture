"use client";

import { useEffect, useState } from "react";

const frameworks = ["Next.js", "React", "Vue", "Astro", "SvelteKit"] as const;

export function HomeRotatingText() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const interval = setInterval(() => {
      setVisible(false);
      timeout = setTimeout(() => {
        setIndex((current) => (current + 1) % frameworks.length);
        setVisible(true);
      }, 200);
    }, 2800);

    return () => {
      clearInterval(interval);
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  return (
    <span className="relative mt-1 block h-[1.15em] w-full">
      {frameworks.map((framework, frameworkIndex) => (
        <span
          aria-hidden={frameworkIndex !== index}
          className={`absolute top-0 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-fd-primary to-fd-primary/60 bg-clip-text text-transparent transition-opacity duration-300 ${
            frameworkIndex === index && visible ? "opacity-100" : "opacity-0"
          }`}
          key={framework}
        >
          {framework}
        </span>
      ))}
    </span>
  );
}

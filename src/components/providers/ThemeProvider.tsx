"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";

type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (nextTheme: ThemePreference) => void;
}

const STORAGE_KEY = "medreq-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeToDom(selectedTheme: ThemePreference) {
  const nextResolvedTheme: ResolvedTheme = selectedTheme === "system" ? getSystemTheme() : selectedTheme;
  const root = document.documentElement;
  root.classList.remove("dark");
  if (nextResolvedTheme === "dark") {
    root.classList.add("dark");
  }
  root.style.colorScheme = nextResolvedTheme;
  root.setAttribute("data-theme", nextResolvedTheme);
  return nextResolvedTheme;
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemePreference>(() => {
    if (typeof window === "undefined") {
      return "light";
    }
    const savedTheme = window.localStorage.getItem(STORAGE_KEY);
    if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
      return savedTheme;
    }
    return "light";
  });
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useLayoutEffect(() => {
    setResolvedTheme(applyThemeToDom(theme));
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemChange = () => {
      if (theme === "system") {
        setResolvedTheme(applyThemeToDom("system"));
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (nextTheme: ThemePreference) => {
        setResolvedTheme(applyThemeToDom(nextTheme));
        setTheme(nextTheme);
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
      },
    }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

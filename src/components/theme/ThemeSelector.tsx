"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export default function ThemeSelector({ compact = false }: { compact?: boolean }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (value: "light" | "dark" | "system") => {
    if (value === "system") {
      return theme === "system";
    }
    return theme === value;
  };

  return (
    <div className={compact ? "inline-flex h-9 items-center" : "inline-flex items-center gap-2"}>
      {!compact && (
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Theme</span>
      )}
      <div className="inline-flex h-9 items-center gap-1 rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
        {!mounted ? (
          <span className="inline-flex h-7 w-[120px] rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden="true" />
        ) : options.map((option) => {
          const Icon = option.icon;
          const active = isActive(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              title={`${option.label} theme`}
              aria-pressed={active}
              className={`inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[10px] font-bold uppercase tracking-wide transition ${
                active
                  ? "bg-slate-950 text-white dark:bg-rose-500 dark:text-white"
                  : "text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {!compact && option.label}
            </button>
          );
        })}
      </div>
      {!compact && (
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300 dark:text-slate-600">{resolvedTheme}</span>
      )}
    </div>
  );
}

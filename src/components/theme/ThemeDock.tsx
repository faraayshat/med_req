"use client";

import ThemeSelector from "@/components/theme/ThemeSelector";
import { usePathname } from "next/navigation";

export default function ThemeDock() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[120] rounded-2xl border border-slate-200/80 bg-white/92 p-1.5 shadow-lg shadow-slate-300/40 backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/92 dark:shadow-none">
      <ThemeSelector compact />
    </div>
  );
}

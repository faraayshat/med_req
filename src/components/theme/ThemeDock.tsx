"use client";

import ThemeSelector from "@/components/theme/ThemeSelector";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function ThemeDock() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className="fixed bottom-4 right-4 z-[120] rounded-2xl border border-slate-200/80 bg-white/92 p-1.5 shadow-lg shadow-slate-300/40 backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/92 dark:shadow-none"
    >
      <ThemeSelector compact />
    </motion.div>
  );
}

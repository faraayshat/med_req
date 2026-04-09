"use client";

import { useTheme } from "@/components/providers/ThemeProvider";

interface BrandLogoProps {
  size?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
}

export default function BrandLogo({
  size = 28,
  className = "",
  alt = "HealthMed logo",
  priority = false,
}: BrandLogoProps) {
  const { resolvedTheme } = useTheme();
  const baseClassName = `object-contain ${className}`.trim();
  const src = resolvedTheme === "dark" ? "/hm_logo_w.svg" : "/hm_logo.svg";

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={baseClassName}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
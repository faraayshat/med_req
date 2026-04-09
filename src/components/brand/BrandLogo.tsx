import Image from "next/image";

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
  return (
    <Image
      src="/hm_logo.svg"
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={`object-contain ${className}`.trim()}
    />
  );
}
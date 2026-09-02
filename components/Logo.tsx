import Image from "next/image";

const LOGO_WIDTH = 546;
const LOGO_HEIGHT = 385;

interface LogoProps {
  /** Display height in pixels; width scales from the official logo aspect ratio. */
  height?: number;
  className?: string;
  priority?: boolean;
}

export default function Logo({
  height = 48,
  className = "",
  priority = false,
}: LogoProps) {
  const width = Math.round(height * (LOGO_WIDTH / LOGO_HEIGHT));

  return (
    <Image
      src="/logo.png"
      alt="Swiss Bullion Depository Vault"
      width={width}
      height={height}
      className={`object-contain bg-transparent ${className}`}
      priority={priority}
      unoptimized
    />
  );
}

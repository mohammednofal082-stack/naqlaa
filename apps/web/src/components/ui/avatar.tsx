import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
  xl: "w-20 h-20",
};

export function Avatar({ src, alt, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden ring-2 ring-white/10",
        sizes[size],
        className
      )}
    >
      <Image src={src} alt={alt} fill className="object-cover" />
    </div>
  );
}

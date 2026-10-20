import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark" | "white";
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  priority?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className,
  variant = "dark",
  size = "md",
  href = "/",
  priority = false,
}) => {
  const isDarkBackground = variant === "white" || variant === "light";

  // Exact proportional dimensions based on 1024x373 aspect ratio (~2.75:1)
  const sizeConfig = {
    sm: { width: 104, height: 38, maxHeight: 36, imgClass: "h-8 sm:h-9" },
    md: { width: 172, height: 63, maxHeight: 58, imgClass: "h-11 sm:h-13 md:h-[58px]" },
    lg: { width: 184, height: 67, maxHeight: 62, imgClass: "h-13 sm:h-15" },
    xl: { width: 210, height: 76, maxHeight: 72, imgClass: "h-15 sm:h-18" },
  };

  const current = sizeConfig[size] || sizeConfig.md;

  const logoImage = (
    <div
      className={cn(
        "relative inline-flex items-center justify-center select-none shrink-0 transition-transform",
        isDarkBackground && "bg-white px-2.5 py-1 rounded-xl shadow-sm border border-white/20",
        className
      )}
    >
      <Image
        src="/images/fyntrust-logo.png"
        alt="FynTrust — Fueling Startups with Smart Finance"
        width={current.width}
        height={current.height}
        priority={priority}
        className={cn(
          "w-auto object-contain select-none block",
          current.imgClass
        )}
        style={{
          height: `${current.maxHeight}px`,
          maxHeight: `${current.maxHeight}px`,
          width: "auto",
        }}
      />
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center hover:opacity-95 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-fyn-primary rounded-lg shrink-0"
        aria-label="FynTrust Home"
      >
        {logoImage}
      </Link>
    );
  }

  return logoImage;
};

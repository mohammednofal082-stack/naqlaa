import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: boolean;
}

export function Card({ className, hover, padding = true, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "card transition-all duration-300",
        padding && "p-6",
        hover && "card-hover cursor-pointer hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-bold text-text", className)} {...props}>
      {children}
    </h3>
  );
}

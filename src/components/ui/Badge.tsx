import React from "react";
import { cn } from "../../utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "teal" | "blue" | "amber" | "red" | "purple" | "gray";
  size?: "sm" | "md";
  className?: string;
}

const variantClasses = {
  green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  teal: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  purple: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = "gray", size = "sm", className }) => (
  <span className={cn(
    "inline-flex items-center font-medium rounded-full",
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
    variantClasses[variant],
    className,
  )}>
    {children}
  </span>
);

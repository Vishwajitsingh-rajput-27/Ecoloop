import React from "react";
import { Star } from "lucide-react";
import { cn } from "../../utils/cn";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
  showValue?: boolean;
  reviewCount?: number;
}

const sizeMap = { sm: 12, md: 16, lg: 20 };

export const StarRating: React.FC<StarRatingProps> = ({
  rating, maxStars = 5, size = "md", interactive = false,
  onRate, className, showValue = false, reviewCount,
}) => {
  const [hovered, setHovered] = React.useState(0);
  const px = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      {Array.from({ length: maxStars }).map((_, i) => {
        const filled = i < Math.round(interactive ? (hovered || rating) : rating);
        return (
          <Star
            key={i}
            size={px}
            className={cn(
              "transition-colors",
              filled ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600",
              interactive && "cursor-pointer hover:scale-110"
            )}
            onClick={() => interactive && onRate?.(i + 1)}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onMouseLeave={() => interactive && setHovered(0)}
          />
        );
      })}
      {showValue && <span className="text-sm font-medium text-gray-600 dark:text-gray-400 ml-0.5">{rating.toFixed(1)}</span>}
      {reviewCount !== undefined && (
        <span className="text-xs text-gray-500 dark:text-gray-500">({reviewCount})</span>
      )}
    </div>
  );
};

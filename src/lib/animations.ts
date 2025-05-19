
import { cn } from "./utils";

type AnimationVariant = 
  | "fade-in" 
  | "slide-up" 
  | "slide-in-right"
  | "scale-in"
  | "bounce";

interface AnimationProps {
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  className?: string;
}

export const animate = ({
  variant = "fade-in",
  delay = 0,
  duration = 300,
  className = ""
}: AnimationProps) => {
  const baseStyles = "animate-in";
  
  const variantStyles: Record<AnimationVariant, string> = {
    "fade-in": "fade-in",
    "slide-up": "fade-in slide-in-from-bottom-4",
    "slide-in-right": "fade-in slide-in-from-right-4",
    "scale-in": "fade-in zoom-in-95",
    "bounce": "animate-bounce"
  };

  return cn(
    baseStyles,
    variantStyles[variant],
    className,
    delay > 0 && `delay-${delay}`,
    duration !== 300 && `duration-${duration}`
  );
};

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  delay?: number;
}

export const ModernCard = ({ children, className, onClick, delay = 0 }: ModernCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl",
        "border border-gray-100",
        "transform hover:-translate-y-1",
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

interface ModernCardImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ModernCardImage = ({ src, alt, className }: ModernCardImageProps) => {
  return (
    <div className="relative w-full h-48 overflow-hidden">
      <motion.img
        src={src}
        alt={alt}
        className={cn("w-full h-full object-cover", className)}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
};

interface ModernCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const ModernCardContent = ({ children, className }: ModernCardContentProps) => {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  );
};

interface ModernCardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const ModernCardTitle = ({ children, className }: ModernCardTitleProps) => {
  return (
    <h3 className={cn("text-xl font-semibold text-gray-900 mb-2", className)}>
      {children}
    </h3>
  );
};

interface ModernCardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const ModernCardDescription = ({ children, className }: ModernCardDescriptionProps) => {
  return (
    <p className={cn("text-gray-600 text-sm line-clamp-3", className)}>
      {children}
    </p>
  );
}; 
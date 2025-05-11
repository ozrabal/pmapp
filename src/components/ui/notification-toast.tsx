import { forwardRef, useEffect, useState } from "react";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const toastVariants = cva(
  "fixed group pointer-events-auto flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-md transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "bg-background border",
        success:
          "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-400",
        error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-400",
        warning:
          "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-400",
        info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  default: Info,
};

export interface NotificationToastProps extends VariantProps<typeof toastVariants> {
  message: string;
  variant?: "default" | "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
}

const NotificationToast = forwardRef<HTMLDivElement, NotificationToastProps>(
  ({ message, variant = "default", duration = 5000, onClose, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(true);
    const Icon = iconMap[variant || "default"];

    useEffect(() => {
      if (!duration) return;

      const timeout = setTimeout(() => {
        setIsVisible(false);
        if (onClose) setTimeout(onClose, 300); // Allow animation to finish
      }, duration);

      return () => clearTimeout(timeout);
    }, [duration, onClose]);

    const handleClose = () => {
      setIsVisible(false);
      if (onClose) setTimeout(onClose, 300); // Allow animation to finish
    };

    if (!isVisible) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="alert"
        aria-live={variant === "error" ? "assertive" : "polite"}
        className={cn(
          toastVariants({ variant }),
          "bottom-4 left-1/2 -translate-x-1/2 max-w-md z-50 data-[state=open]:animate-in",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-80",
          "data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-bottom-full"
        )}
        data-state={isVisible ? "open" : "closed"}
        {...props}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <div className="text-sm font-medium">{message}</div>
        </div>
        <button
          onClick={handleClose}
          className="rounded-md p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Zamknij"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }
);

NotificationToast.displayName = "NotificationToast";

export { NotificationToast };

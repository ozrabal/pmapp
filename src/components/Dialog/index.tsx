import { useState, type ReactNode, useEffect, useRef } from "react";
import {
  Dialog as DialogRoot,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface DialogAction {
  label: string;
  onClick?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  disabled?: boolean;
}

export interface DialogProps {
  title?: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
  contentHTML?: string;
  children?: ReactNode;
  trigger?: ReactNode;
  triggerSelector?: string; // Added selector support for use in Astro
  className?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  actions?: DialogAction[];
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  width?: string;
}

export default function Dialog({
  title,
  description,
  content,
  contentHTML,
  children,
  trigger,
  triggerSelector,
  className,
  open,
  defaultOpen,
  onOpenChange,
  actions,
  cancelLabel = "Anuluj",
  confirmLabel = "Potwierdź",
  onCancel,
  onConfirm,
  confirmVariant = "default",
  width = "sm:max-w-lg",
}: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen || false);
  const triggerRef = useRef<Element | null>(null);

  // Handle both controlled and uncontrolled modes
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  // Effect to find and connect to external trigger element if selector is provided
  useEffect(() => {
    if (triggerSelector) {
      const externalTrigger = document.querySelector(triggerSelector);
      if (externalTrigger) {
        triggerRef.current = externalTrigger;
        const handleClick = () => {
          setInternalOpen(true);
        };
        externalTrigger.addEventListener('click', handleClick);
        return () => {
          externalTrigger.removeEventListener('click', handleClick);
        };
      }
    }
  }, [triggerSelector]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const handleCancel = () => {
    onCancel?.();
    if (!isControlled) {
      setInternalOpen(false);
    }
  };

  const handleConfirm = () => {
    onConfirm?.();
    if (!isControlled) {
      setInternalOpen(false);
    }
  };

  // If custom actions are provided, use them. Otherwise use default confirm/cancel buttons if callbacks are provided
  const footerActions = actions || [
    ...(onCancel ? [{ label: cancelLabel, onClick: handleCancel, variant: "outline" as const }] : []),
    ...(onConfirm ? [{ label: confirmLabel, onClick: handleConfirm, variant: confirmVariant }] : [])
  ];

  return (
    <DialogRoot open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      
      <DialogContent className={`${width} ${className || ""}`}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        
        {content && content}
        {contentHTML && <div dangerouslySetInnerHTML={{ __html: contentHTML }} />}
        {children}
        
        {footerActions.length > 0 && (
          <DialogFooter className="gap-2 sm:gap-0">
            {footerActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "default"}
                onClick={action.onClick}
                disabled={action.disabled}
                className="mt-2"
              >
                {action.label}
              </Button>
            ))}
          </DialogFooter>
        )}
      </DialogContent>
    </DialogRoot>
  );
}

// Export individual components for more complex use cases
export {
  DialogRoot,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
};
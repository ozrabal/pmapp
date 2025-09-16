import { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from "react";
import { NotificationToast } from "@/components/ui/notification-toast";

type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextValue {
  notifications: Notification[];
  showNotification: (message: string, type: NotificationType) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);
  const showNotification = useCallback(
    (message: string, type: NotificationType) => {
      const id = Date.now().toString();
      setNotifications((prev) => [...prev, { id, message, type }]);

      // Automatically remove notifications after 5 seconds
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    },
    [removeNotification]
  );

  // Add event listener for custom toast events
  useEffect(() => {
    const handleToastEvent = (event: CustomEvent) => {
      const { message, type } = event.detail;
      if (message && type) {
        showNotification(message, type);
      }
    };

    document.addEventListener("toast", handleToastEvent as EventListener);

    return () => {
      document.removeEventListener("toast", handleToastEvent as EventListener);
    };
  }, [showNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
      <div className="fixed bottom-4 left-0 right-0 flex flex-col items-center gap-2 z-50">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            message={notification.message}
            variant={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

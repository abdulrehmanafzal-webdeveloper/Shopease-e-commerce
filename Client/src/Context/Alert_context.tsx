// src/context/Alert_context.tsx
import { createContext, useState, useContext, useRef, useCallback } from "react";
import type { ReactNode } from "react";

interface Alert {
  type: "success" | "error";
  message: string;
  undoAction?: () => void; // optional callback if undo is available
}

interface AlertContextType {
  alert: Alert | null;
  showAlert: (
    type: Alert["type"],
    message: string,
    undoAction?:() => void
  ) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alert, setAlert] = useState<Alert | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showAlert = useCallback(
    (type: Alert["type"], message: string, undoAction?: () => void) => {
      setAlert({ type, message, undoAction });

      // clear any previous timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setAlert(null);
      }, 3500);
    },
    []
  );

  const hideAlert = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAlert(null);
  }, []);

  return (
    <AlertContext.Provider value={{ alert, showAlert, hideAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlert must be used inside AlertProvider");
  return context;
};

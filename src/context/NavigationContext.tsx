"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface NavigationContextType {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  confirmNavigation: (targetHref: string) => void;
  showGlobalExitModal: boolean;
  setShowGlobalExitModal: (value: boolean) => void;
  pendingHref: string | null;
  resetNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showGlobalExitModal, setShowGlobalExitModal] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const router = useRouter();

  const confirmNavigation = (targetHref: string) => {
    if (hasUnsavedChanges) {
      setPendingHref(targetHref);
      setShowGlobalExitModal(true);
    } else {
      router.push(targetHref);
    }
  };

  const resetNavigation = () => {
    setHasUnsavedChanges(false);
    setShowGlobalExitModal(false);
    setPendingHref(null);
  };

  return (
    <NavigationContext.Provider 
      value={{ 
        hasUnsavedChanges, 
        setHasUnsavedChanges, 
        confirmNavigation, 
        showGlobalExitModal, 
        setShowGlobalExitModal,
        pendingHref,
        resetNavigation
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationGuard() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigationGuard must be used within a NavigationProvider");
  }
  return context;
}

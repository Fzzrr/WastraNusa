'use client';

import { type ReactNode, createContext, useContext, useState } from 'react';

type SellerSidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SellerSidebarContext = createContext<SellerSidebarContextValue | null>(
  null,
);

export function SellerSidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <SellerSidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SellerSidebarContext.Provider>
  );
}

export function useSellerSidebar() {
  const context = useContext(SellerSidebarContext);
  if (!context) {
    throw new Error(
      'useSellerSidebar must be used within a SellerSidebarProvider',
    );
  }
  return context;
}

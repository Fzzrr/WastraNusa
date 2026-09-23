'use client';

import { type ReactNode, createContext, useContext, useState } from 'react';

type AdminSidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const AdminSidebarContext = createContext<AdminSidebarContextValue | null>(
  null,
);

export function AdminSidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <AdminSidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  const context = useContext(AdminSidebarContext);
  if (!context) {
    throw new Error(
      'useAdminSidebar must be used within an AdminSidebarProvider',
    );
  }
  return context;
}

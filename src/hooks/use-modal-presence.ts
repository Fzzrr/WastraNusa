'use client';

import { useEffect, useState } from 'react';

/**
 * Keeps a modal mounted during its close animation and locks page scroll
 * while it is open. Returns `false` once the modal can unmount.
 */
export function useModalPresence(isOpen: boolean, exitMs = 300) {
  const [mounted, setMounted] = useState(isOpen);
  if (isOpen && !mounted) setMounted(true);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setMounted(false), exitMs);
      return () => clearTimeout(timer);
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, exitMs]);

  return mounted;
}

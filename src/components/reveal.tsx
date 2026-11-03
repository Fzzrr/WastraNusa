'use client';

import { type ReactNode, useEffect, useRef } from 'react';

type RevealProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Fades and lifts its direct children in, staggered (see globals.css), the
 * first time the container scrolls into view. Containers already on screen at
 * mount are left alone, so nothing above the fold ever blinks and content
 * stays visible without JavaScript.
 */
export function Reveal({ children, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.reveal = 'pending';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        el.dataset.reveal = 'shown';
        observer.disconnect();
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-reveal="" className={className}>
      {children}
    </div>
  );
}

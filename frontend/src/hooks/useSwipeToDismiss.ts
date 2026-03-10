import { useRef, type RefObject } from 'react';

interface SwipeOptions {
  onDismiss: () => void;
  direction: 'left' | 'right';
  threshold?: number;
}

export function useSwipeToDismiss<T extends HTMLElement>(
  options: SwipeOptions
): {
  ref: RefObject<T | null>;
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
} {
  const ref = useRef<T>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const swiping = useRef(false);
  const { onDismiss, direction, threshold = 80 } = options;

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
    swiping.current = true;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!swiping.current || !ref.current) return;
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;

    // Only allow swiping in the dismiss direction
    const allowed = direction === 'right' ? diff > 0 : diff < 0;
    if (!allowed) {
      ref.current.style.transform = '';
      return;
    }

    ref.current.style.transition = 'none';
    ref.current.style.transform = `translateX(${diff}px)`;
  };

  const onTouchEnd = () => {
    if (!swiping.current || !ref.current) return;
    swiping.current = false;
    const diff = currentX.current - startX.current;
    const dismissed = direction === 'right' ? diff > threshold : diff < -threshold;

    if (dismissed) {
      ref.current.style.transition = 'transform 0.2s ease-out';
      ref.current.style.transform = `translateX(${direction === 'right' ? '100%' : '-100%'})`;
      setTimeout(onDismiss, 200);
    } else {
      ref.current.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      ref.current.style.transform = '';
    }
  };

  return { ref, handlers: { onTouchStart, onTouchMove, onTouchEnd } };
}

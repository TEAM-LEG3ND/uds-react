import { useEffect, useRef } from "react";

interface UseSwipeProps {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const useSwipe = <EL extends HTMLElement>({
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
}: UseSwipeProps) => {
  const elementRef = useRef<EL | null>(null);
  const startY = useRef<number | null>(null);
  const startX = useRef<number | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (
        elementRef.current &&
        elementRef.current.contains(e.target as HTMLElement)
      ) {
        startY.current = e.touches[0].clientY;
        startX.current = e.touches[0].clientX;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (startY.current) {
        const endY = e.changedTouches[0].clientY;

        if (onSwipeUp && endY < startY.current) {
          onSwipeUp();
        } else if (onSwipeDown && endY > startY.current) {
          onSwipeDown();
        }

        startY.current = null;
      }

      if (startX.current) {
        const endX = e.changedTouches[0].clientX;

        if (onSwipeLeft && endX > startX.current) {
          onSwipeLeft();
        } else if (onSwipeRight && endX < startX.current) {
          onSwipeRight();
        }

        startX.current = null;
      }
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight]);

  return { elementRef };
};

export default useSwipe;

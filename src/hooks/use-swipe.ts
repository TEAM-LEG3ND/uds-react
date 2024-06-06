import { useEffect, useRef } from "react";

type UseSwipeOptions = {
  throttle: number;
};

interface UseSwipeProps {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  options?: UseSwipeOptions;
}

type Coord = {
  x: number;
  y: number;
};

enum Direction {
  "U",
  "D",
  "R",
  "L",
}

const useSwipe = <EL extends HTMLElement>({
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  options = { throttle: 0 },
}: UseSwipeProps) => {
  const elementRef = useRef<EL | null>(null);
  const startRef = useRef<Coord | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (
        elementRef.current &&
        elementRef.current.contains(e.target as HTMLElement)
      ) {
        startRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const start = startRef.current;
      const throttle = options.throttle;
      const end = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };
      const isSwipe = start && calculateDistance(start, end) > throttle;

      if (isSwipe) {
        const direction = getSwipeDirection(start, end);

        switch (direction) {
          case Direction.D:
            onSwipeDown && onSwipeDown();
            break;
          case Direction.U:
            onSwipeUp && onSwipeUp();
            break;
          case Direction.L:
            onSwipeLeft && onSwipeLeft();
            break;
          case Direction.R:
            onSwipeRight && onSwipeRight();
            break;
          default:
            break;
        }
      }
      startRef.current = null;
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [options.throttle, onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight]);

  return { elementRef };
};

const calculateDistance = (coord1: Coord, coord2: Coord) =>
  Math.sqrt((coord2.y - coord1.y) ** 2 + (coord2.x - coord1.x) ** 2);

const calculateSlope = (coord1: Coord, coord2: Coord) => {
  return (coord2.y - coord1.y) / (coord2.x - coord1.x);
};

const getSwipeDirection = (start: Coord, end: Coord): Direction => {
  const slope = calculateSlope(start, end);

  const isVertical = Math.abs(slope) >= 1;
  const toRight = !isVertical && end.x > start.x;
  const toLeft = !isVertical && start.x > end.x;
  const toUp = isVertical && start.y > end.y;
  const toDown = isVertical && end.y > start.y;

  if (toRight) return Direction.R;
  else if (toLeft) return Direction.L;
  else if (toUp) return Direction.U;
  else if (toDown) return Direction.D;

  return Direction.U;
};

export default useSwipe;

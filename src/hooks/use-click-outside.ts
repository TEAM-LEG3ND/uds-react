import { useEffect, useRef } from "react";

type ClickEvent = "mousedown" | "mouseup" | "click" | "touchstart" | "touchend";

export const useClickOutside = <EL extends HTMLElement>(
  onClickOutside: (e?: MouseEvent | TouchEvent) => void,
  event: ClickEvent = "click"
) => {
  const targetRef = useRef<EL | null>(null);
  const cbRef = useRef(onClickOutside);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const ignore =
        !targetRef.current ||
        targetRef.current.contains(e.target as HTMLElement);

      if (ignore) return;
      cbRef.current(e);
    };
    document.body.addEventListener(event, handler);

    return () => {
      document.body.removeEventListener(event, handler);
    };
  }, [event]);

  return { targetRef };
};

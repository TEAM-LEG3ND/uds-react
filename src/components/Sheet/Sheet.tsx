import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useUnmount } from "@/hooks/use-unmount";

import classNames from "./Sheet.module.css";

interface RootProps {
  visibility: number;
  trigger?: ReactNode;
  content: ReactNode;
  direction?: "b" | "r" | "l" | "t";
  hasOverlay?: boolean;
  onClickOverlay?: () => void;
}

export default function Sheet({
  visibility,
  trigger,
  content,
  hasOverlay = false,
  onClickOverlay = () => {},
}: RootProps) {
  const { isPresent, ref: sheetRef } = useUnmount<HTMLDivElement>(!!visibility);
  const prevVisibilityRef = useRef<number>(visibility);
  const ref = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<CSSProperties>({
    transform: "translateY(0%)",
  });

  useEffect(() => {
    if (isPresent) {
      setStyle({
        transform: `translateY(${prevVisibilityRef.current - visibility}%)`,
      });
    }
  }, [isPresent, visibility]);

  return (
    <div className={classNames.root}>
      {trigger}
      {createPortal(
        <>
          {
            <>
              {hasOverlay && isPresent ? (
                <div
                  role="presentation"
                  onClick={onClickOverlay}
                  className={classNames.overlay}
                />
              ) : null}
              {isPresent ? (
                <div
                  ref={(node) => {
                    if (node) {
                      sheetRef(node);
                      ref.current = node;
                    }
                  }}
                  style={style}
                  className={classNames.container}
                >
                  {content}
                </div>
              ) : null}
            </>
          }
        </>,
        document.body
      )}
    </div>
  );
}

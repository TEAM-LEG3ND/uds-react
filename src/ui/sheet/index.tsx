import {
  CSSProperties,
  forwardRef,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import usePresence from "@/hooks/use-presence";
import { compoundRefs } from "@/utils";

import classNames from "./index.module.css";

interface RootProps {
  visibility: number;
  trigger?: ReactNode;
  content: ReactNode;
  direction?: "b" | "r" | "l" | "t";
  hasOverlay?: boolean;
  onClickOverlay?: () => void;
}

const Sheet = forwardRef<HTMLDivElement, RootProps>(
  (
    {
      visibility,
      trigger,
      content,
      hasOverlay = false,
      onClickOverlay = () => {},
    }: RootProps,
    ref
  ) => {
    const { isPresent, ref: sheetRef } =
      usePresence<HTMLDivElement>(!!visibility);
    const prevVisibilityRef = useRef<number>(visibility);
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
                    ref={compoundRefs([sheetRef, ref])}
                    style={style}
                    data-full={visibility === 100}
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
);
Sheet.displayName = "Sheet";

export default Sheet;

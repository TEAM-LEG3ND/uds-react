import {
  ReactNode,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import classNames from "./Sheet.module.css";

interface RootProps {
  open: boolean;
  trigger: ReactNode;
  content: ReactNode;
  direction?: "b" | "r" | "l" | "t";
  hasOverlay?: boolean;
  onClickOverlay?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (
  x: infer R
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => any
  ? R
  : never;

export default function Sheet({
  open,
  trigger,
  content,
  hasOverlay = false,
  onClickOverlay = () => {},
}: RootProps) {
  const [sheet, setSheet] = useState<HTMLElement | null>(null);
  const stateMachine = {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended",
    },
    unmountSuspended: {
      MOUNT: "mounted",
      ANIMATION_END: "unmounted",
    },
    unmounted: {
      MOUNT: "mounted",
    },
  };
  const stylesRef = useRef<CSSStyleDeclaration | null>(null);
  const prevOpenRef = useRef<boolean>(open);
  const initialState = open ? "mounted" : "unmounted";

  const [state, dispatch] = useReducer(
    (
      state: keyof typeof stateMachine,
      action: keyof UnionToIntersection<
        (typeof stateMachine)[keyof typeof stateMachine]
      >
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nextState = (stateMachine[state] as any)[action];

      return nextState ?? state;
    },
    initialState
  );

  useLayoutEffect(() => {
    const openChanged = prevOpenRef.current !== open;
    if (!openChanged) return;
    const hasAnimation =
      !!stylesRef.current?.getPropertyValue("animation-name");
    if (open) {
      dispatch("MOUNT");
    } else if (!hasAnimation) {
      dispatch("ANIMATION_END");
    } else {
      dispatch("ANIMATION_OUT");
    }
    prevOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!sheet) return;
    const handleAnimationEnd = () => {
      dispatch("ANIMATION_END");
    };

    sheet.addEventListener("animationend", handleAnimationEnd);
    sheet.addEventListener("animationcancel", handleAnimationEnd);
  }, [sheet, dispatch]);

  const isPresent = ["mounted", "unmountSuspended"].includes(state);

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
                  ref={(node: HTMLDivElement) => {
                    setSheet(node);
                    if (node) {
                      stylesRef.current = getComputedStyle(node);
                    }
                  }}
                  className={classNames.container}
                  data-state={open ? "open" : "close"}
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

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { useStateMachine } from "@/hooks/use-state-machine";

const usePresence = <EL extends HTMLElement>(present: boolean = false) => {
  const [node, setNode] = useState<EL | null>(null);
  const stylesRef = useRef<CSSStyleDeclaration | null>(null);
  const prevPresentRef = useRef<boolean>(present);
  const initialState = present ? "mounted" : "unmounted";
  const [state, send] = useStateMachine(
    {
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
    },
    initialState
  );

  useLayoutEffect(() => {
    const presentChanged = prevPresentRef.current !== present;
    if (!presentChanged) return;
    const hasAnimation =
      (stylesRef.current?.getPropertyValue("animation-name") || "none") !==
        "none" ||
      ((stylesRef.current?.getPropertyValue("transform") || "none") !==
        "none" &&
        (stylesRef.current?.getPropertyValue("transitionDuration") ||
          "none") !== "none");

    if (present) {
      send("MOUNT");
    } else if (!hasAnimation) {
      send("UNMOUNT");
    } else {
      send("ANIMATION_OUT");
    }
    prevPresentRef.current = present;
  }, [present, send]);

  useEffect(() => {
    if (!node) return;
    const handleAnimationEnd = () => {
      flushSync(() => {
        send("ANIMATION_END");
      });
    };

    node.addEventListener("animationend", handleAnimationEnd);
    node.addEventListener("animationcancel", handleAnimationEnd);
    node.addEventListener("transitionend", handleAnimationEnd);
    node.addEventListener("transitioncancel", handleAnimationEnd);

    return () => {
      node.removeEventListener("animationend", handleAnimationEnd);
      node.removeEventListener("animationcancel", handleAnimationEnd);
      node.removeEventListener("transitionend", handleAnimationEnd);
      node.removeEventListener("transitioncancel", handleAnimationEnd);
    };
  }, [node, send]);

  const isPresent = ["mounted", "unmountSuspended"].includes(state);

  return {
    ref: (node: EL) => {
      setNode(node);
      if (node) {
        stylesRef.current = getComputedStyle(node);
      }
    },
    isPresent,
  };
};

export default usePresence;

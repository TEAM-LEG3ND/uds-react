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

    const noAnimation = !(stylesRef.current && hasAnimation(stylesRef.current));

    if (present) {
      send("MOUNT");
    } else if (noAnimation) {
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

const hasAnimation = (style: CSSStyleDeclaration) => {
  const hasAnimation =
    style.animationName !== "none" && style.animationName !== "";
  const hasTransition =
    style.transitionProperty !== "none" &&
    style.transitionProperty !== "" &&
    style.transitionDuration !== "0s";
  const hasTransform =
    style.transform !== "none" &&
    style.transform !== "matrix(1, 0, 0, 1, 0, 0)";
  const hasOpacity = style.opacity !== "1";
  const hasFilter = style.filter !== "none" && style.filter !== "";

  return (
    hasAnimation || (hasTransition && hasTransform) || hasOpacity || hasFilter
  );
};

export default usePresence;

import { MutableRefObject, Ref } from "react";

export const compoundRefs =
  <T>(refs: Ref<T>[]) =>
  (node: T) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as MutableRefObject<T>).current = node;
      }
    }
  };

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

export const takeTopN = <T>(arr: T[], n: number) => {
  let i = 0;
  const res = [];
  for (const v of arr) {
    if (i === n) return res;
    res.push(v);
    i += 1;
  }

  return res;
};

export const calculateDirectWTMDistance = (
  start: { x: number; y: number },
  end: { x: number; y: number }
) => {
  return Math.round(Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2));
};

export const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

import { MutableRefObject, Ref } from "react";

import { type TPosition } from "@/models/spot";

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

export const translateWGS84ToWTMAsync = (x: number, y: number) => {
  const geocoder = new kakao.maps.services.Geocoder();

  return new Promise<{ x: number; y: number }>((resolve, reject) => {
    geocoder.transCoord(
      x,
      y,
      ([res], status) => {
        if (status === kakao.maps.services.Status.ERROR)
          reject("translation failed");
        else resolve(res);
      },
      {
        input_coord: kakao.maps.services.Coords.WGS84,
        output_coord: kakao.maps.services.Coords.WTM,
      }
    );
  });
};

export const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

const cacheKey = {
  prevPosition: {
    lat: "prevLat",
    lgt: "prevLgt",
  },
};

export const getMyPositionCache = (): TPosition | null => {
  try {
    const lat = localStorage.getItem(cacheKey.prevPosition.lat);
    const lgt = localStorage.getItem(cacheKey.prevPosition.lgt);
    if (!lat || !lgt) return null;

    return {
      latitude: Number(lat),
      longitude: Number(lgt),
    };
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const setMyPositionCache = (position: TPosition) => {
  try {
    localStorage.setItem(
      cacheKey.prevPosition.lat,
      position.latitude.toString()
    );
    localStorage.setItem(
      cacheKey.prevPosition.lgt,
      position.longitude.toString()
    );
  } catch (err) {
    console.error(err);
  }
};

export const promisify = <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (...args: any[]) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ((...args: any[]) => Promise<T>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any[]) =>
    new Promise<T>((resolve, reject) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fn(...args, (err: any, res: T) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      })
    );
};

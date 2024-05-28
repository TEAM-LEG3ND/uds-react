import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { TPosition } from "@/types/models";

export const useGeolocation = (defaultPos: TPosition | (() => TPosition)) => {
  const [currentPosition, setCurrentPosition] = useState<TPosition>(defaultPos);
  const watchIdRef = useRef(0);

  useEffect(() => {
    const watch = () => {
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported");
        return;
      }
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) =>
          setCurrentPosition({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        (err) => console.error(err)
      );
    };

    const stop = () => {
      navigator.geolocation.clearWatch(watchIdRef.current);
    };

    watch();

    return () => stop();
  }, []);

  return { currentPosition };
};

export const getCurrentPositionPromise = (
  options?: PositionOptions & { signal?: AbortSignal }
) =>
  new Promise<TPosition>((resolve, reject) => {
    if (options?.signal?.aborted) reject(options.signal.reason);

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => reject(err),
      options
    );

    options?.signal?.addEventListener("abort", () => {
      reject(options.signal?.reason);
    });
  });

export const useCurrentPositionQuery = (
  defaultPos: TPosition,
  options?: PositionOptions & { signal: AbortSignal }
) => {
  return useQuery({
    queryKey: ["geolocation", "current"],
    queryFn: () => getCurrentPositionPromise(options),
    staleTime: 30000,
    initialData: defaultPos,
  });
};

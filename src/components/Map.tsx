import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { MapProvider } from "@/components/MapProvider";

interface MapProps {
  center: { latitude: number; longitude: number };
  onInit: (map: kakao.maps.Map) => void;
  onChangeBounds: (boundary: kakao.maps.LatLngBounds) => void;
  children?: ReactNode;
  className: string;
}

function Map({
  center,
  onInit,
  onChangeBounds,
  children,
  className,
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const { map: kakaoMap, init } = useKakaoMap();
  const onInitializeRef = useRef(onInit);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = init(mapContainerRef.current, {
      center: new kakao.maps.LatLng(center.latitude, center.longitude),
      level: 2,
      draggable: true,
    });

    onInitializeRef.current(map);
  }, [center.latitude, center.longitude, init]);

  useEffect(() => {
    if (!kakaoMap) return;

    const changeBoundsListener = () => {
      onChangeBounds(kakaoMap.getBounds());
    };

    kakao.maps.event.addListener(kakaoMap, "idle", changeBoundsListener);

    return () => {
      kakao.maps.event.removeListener(kakaoMap, "idle", changeBoundsListener);
    };
  }, [kakaoMap, onChangeBounds]);

  return (
    <div ref={mapContainerRef} className={className}>
      <MapProvider map={kakaoMap}>{children}</MapProvider>
    </div>
  );
}

const useKakaoMap = () => {
  const [map, setMap] = useState<kakao.maps.Map | null>(null);

  const init = useCallback(
    (container: HTMLElement, options: kakao.maps.MapOptions) => {
      const initialMap = new kakao.maps.Map(container, options);
      setMap(initialMap);

      return initialMap;
    },
    []
  );

  return { map, init };
};

export default Map;

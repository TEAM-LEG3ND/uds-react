import { ReactNode, useEffect, useRef, useState } from "react";

import { Spinner } from "@/components/Loader";
import classNames from "@/components/Map.module.css";
import { MapProvider } from "@/components/MapProvider";
import Toast from "@/components/toast/Toast";
import { CENTER_OF_SEOUL } from "@/constants";
import { getCurrentPositionPromise } from "@/hooks/use-geolocation";
import { getCachedCurrentPosition, setCurrentPositionCache } from "@/utils";
interface MapProps {
  onInit: (map: kakao.maps.Map) => void;
  onChangeBounds: (boundary: kakao.maps.LatLngBounds) => void;
  children?: ReactNode;
  className: string;
}

function Map({ onInit, onChangeBounds, children, className }: MapProps) {
  const [kakaoMap, setKakaoMap] = useState<kakao.maps.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onInitializeRef = useRef(onInit);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const initialPosition = getCachedCurrentPosition() ?? CENTER_OF_SEOUL;

    const map = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(
        initialPosition.latitude,
        initialPosition.longitude
      ),
      level: 2,
      draggable: true,
    });
    setKakaoMap(map);

    onInitializeRef.current && onInitializeRef.current(map);
  }, []);

  useEffect(() => {
    if (!kakaoMap) return;
    abortControllerRef.current = new AbortController();

    const getCurrentPosition = async () => {
      try {
        setIsLoading(true);
        const currentPosition = await getCurrentPositionPromise({
          signal: abortControllerRef.current?.signal,
          timeout: 5000,
        });

        kakaoMap.setCenter(
          new kakao.maps.LatLng(
            currentPosition.latitude,
            currentPosition.longitude
          )
        );

        setCurrentPositionCache(currentPosition);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    };
    getCurrentPosition();
  }, [kakaoMap]);

  useEffect(() => {
    if (!kakaoMap) return;

    const changeBoundsListener = () => {
      onChangeBounds(kakaoMap.getBounds());
      abortControllerRef.current && abortControllerRef.current.abort();
    };

    kakao.maps.event.addListener(kakaoMap, "idle", changeBoundsListener);

    return () => {
      kakao.maps.event.removeListener(kakaoMap, "idle", changeBoundsListener);
    };
  }, [kakaoMap, onChangeBounds]);

  return (
    <div ref={containerRef} className={className}>
      <MapProvider map={kakaoMap}>
        {children}
        <Toast
          visible={isLoading}
          content={
            <div className={classNames.current_position_loader}>
              <Spinner /> 현재 위치를 불러오는 중입니다...
            </div>
          }
        />
      </MapProvider>
    </div>
  );
}

export default Map;

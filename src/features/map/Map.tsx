import { ReactNode, useEffect, useRef, useState } from "react";

import { CENTER_OF_SEOUL } from "@/constants";
import { getMyPositionPromise } from "@/effects/geolocation";
import { MapProvider } from "@/features/map/MapProvider";
import { TBoundary } from "@/models/map";
import { Spinner } from "@/ui/loader";
import Toast from "@/ui/toast";
import { getMyPositionCache, setMyPositionCache } from "@/utils";

import classNames from "./Map.module.css";

interface MapProps {
  onInit: (map: kakao.maps.Map) => void;
  onChangeBounds: (boundary: TBoundary) => void;
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

    const initialPosition = getMyPositionCache() ?? CENTER_OF_SEOUL;

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

    const getMyPosition = async () => {
      try {
        setIsLoading(true);
        const myPosition = await getMyPositionPromise({
          signal: abortControllerRef.current?.signal,
          timeout: 10000,
        });

        kakaoMap.setCenter(
          new kakao.maps.LatLng(myPosition.latitude, myPosition.longitude)
        );

        setMyPositionCache(myPosition);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    };
    getMyPosition();
  }, [kakaoMap]);

  useEffect(() => {
    if (!kakaoMap) return;

    const changeBoundsListener = () => {
      const bounds = kakaoMap.getBounds();
      const swLatLng = bounds.getSouthWest();
      const neLatLng = bounds.getNorthEast();
      const boundary: TBoundary = {
        swlat: swLatLng.getLat(),
        swlng: swLatLng.getLng(),
        nelat: neLatLng.getLat(),
        nelng: neLatLng.getLng(),
      };

      onChangeBounds(boundary);
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

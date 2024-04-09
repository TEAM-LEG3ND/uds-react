import { useEffect, useRef, useState } from "react";

import classNames from "@/pages/index.module.css";

export default function HomePage() {
  const [currentPos, setCurrentPos] = useState({
    latitude: 0,
    longitude: 0,
  });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const kakaoMapRef = useRef<kakao.maps.Map | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentPos({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => console.error(err),
      {
        enableHighAccuracy: true,
      }
    );
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const mapOption = {
      center: new kakao.maps.LatLng(currentPos.latitude, currentPos.longitude),
      level: 2,
    };
    kakaoMapRef.current = new kakao.maps.Map(
      mapContainerRef.current,
      mapOption
    );
  }, [currentPos]);

  return (
    <main className={classNames.container}>
      <div ref={mapContainerRef} className={classNames.kakao_map} />
    </main>
  );
}

// 카카오 맵 띄우기
// 현재 위치 받아오기
// /api/v1/spots로 주변 산스장 목록 가져오기
// 지도에 산스장 위치 띄우기
// 위치 클릭 시 상세 bottom sheet 띄우기
// 위치 외에 클릭 시 bottom sheet 닫기

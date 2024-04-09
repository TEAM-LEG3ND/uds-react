import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import classNames from "@/pages/index.module.css";
import { Gym } from "@/types/models";

export default function HomePage() {
  const [currentPos, setCurrentPos] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [gymList, setGymList] = useState([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const kakaoMapRef = useRef<kakao.maps.Map | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentPos({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => console.error(err)
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

  useEffect(() => {
    if (!kakaoMapRef.current) return;
    if (currentPos.latitude === 0 && currentPos.longitude === 0) return;

    const mapBoundary = kakaoMapRef.current.getBounds();
    const swLanLng = mapBoundary.getSouthWest();
    const neLanLng = mapBoundary.getNorthEast();

    const fetchData = async () => {
      const gymList = await queryClient.fetchQuery({
        queryKey: ["spots", currentPos.latitude, currentPos.longitude],
        queryFn: async () => {
          const res = await fetch(
            `${import.meta.env.VITE_API_ENDPOINT}/spots?swlat=${swLanLng.getLat()}&swlng=${swLanLng.getLng()}&nelat=${neLanLng.getLat()}&nelng=${neLanLng.getLng()}`
          );
          const data = await res.json();

          return data;
        },
        staleTime: Infinity,
      });

      setGymList(gymList);
    };
    fetchData();
  }, [currentPos.latitude, currentPos.longitude, queryClient]);

  useEffect(() => {
    if (!kakaoMapRef.current) return;

    const gymMarkerList = gymList
      .map((gym: Gym) => new kakao.maps.LatLng(gym.latitude, gym.longitude))
      .map(
        (pos) =>
          new kakao.maps.Marker({
            position: pos,
          })
      );

    for (const marker of gymMarkerList) {
      marker.setMap(kakaoMapRef.current);
    }
  }, [gymList]);

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

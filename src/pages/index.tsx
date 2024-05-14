import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import Sheet from "@/components/Sheet/Sheet";
import { useSheet } from "@/components/Sheet/Sheet.hooks";
import GymMarker from "@/models/GymMarker";
import classNames from "@/pages/index.module.css";
import { Gym } from "@/types/models";

export default function HomePage() {
  const [currentPos, setCurrentPos] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [gymList, setGymList] = useState<Gym[]>([]);
  const [selectedGym, setSelectedGym] = useState<Gym>({
    id: 0,
    name: "",
    description: "",
    address: "",
    latitude: 0,
    longitude: 0,
    facilities: [],
  });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const kakaoMapRef = useRef<kakao.maps.Map | null>(null);
  const queryClient = useQueryClient();
  const { visibility, open, close } = useSheet();
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const startY = useRef<number | null>(null);

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
      draggable: true,
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
        queryKey: ["spots", "current"],
        queryFn: async () => {
          const res = await fetch(
            `${import.meta.env.VITE_API_ENDPOINT}/spots/boundary?swlat=${swLanLng.getLat()}&swlng=${swLanLng.getLng()}&nelat=${neLanLng.getLat()}&nelng=${neLanLng.getLng()}`
          );
          const data = await res.json();

          return data;
        },
      });

      setGymList(gymList);
    };
    fetchData();
  }, [currentPos.latitude, currentPos.longitude, queryClient]);

  useEffect(() => {
    if (!kakaoMapRef.current) return;

    const gymMarkerList = gymList.map(
      (gym) =>
        new GymMarker(gym, {
          position: new kakao.maps.LatLng(gym.latitude, gym.longitude),
          title: gym.name,
          clickable: true,
        })
    );

    for (const marker of gymMarkerList) {
      marker.setMap(kakaoMapRef.current);
    }
    for (const marker of gymMarkerList) {
      kakao.maps.event.addListener(marker, "click", () => {
        setSelectedGym(marker.getGym());
        open(40);
      });
    }
  }, [gymList, open]);

  useEffect(() => {
    if (!kakaoMapRef.current) return;
    const boundsChangeListener = async () => {
      queryClient.cancelQueries({
        queryKey: ["spots", "current"],
      });
      const mapBoundary = kakaoMapRef.current!.getBounds();
      const swLanLng = mapBoundary.getSouthWest();
      const neLanLng = mapBoundary.getNorthEast();
      const data = await queryClient.fetchQuery({
        queryKey: [],
        queryFn: async () => {
          const res = await fetch(
            `${import.meta.env.VITE_API_ENDPOINT}/spots/boundary?swlat=${swLanLng.getLat()}&swlng=${swLanLng.getLng()}&nelat=${neLanLng.getLat()}&nelng=${neLanLng.getLng()}`
          );
          const data = await res.json();

          return data;
        },
      });
      setGymList(data);
    };
    kakao.maps.event.addListener(
      kakaoMapRef.current,
      "idle",
      boundsChangeListener
    );

    return () => {
      if (!kakaoMapRef.current) return;
      kakao.maps.event.removeListener(
        kakaoMapRef.current,
        "idle",
        boundsChangeListener
      );
    };
  }, [queryClient, kakaoMapRef.current]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sheetRef.current &&
        !sheetRef.current.contains(e.target as HTMLElement)
      ) {
        close();
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, [close]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (
        sheetRef.current &&
        sheetRef.current.contains(e.target as HTMLElement)
      ) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startY.current) return;
      const endY = e.changedTouches[0].clientY;
      if (endY < startY.current) {
        open(100);
      }

      startY.current = null;
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [open]);

  return (
    <main className={classNames.container}>
      <div ref={mapContainerRef} className={classNames.kakao_map} />
      <Sheet
        ref={sheetRef}
        content={
          <div>
            <div>{JSON.stringify(selectedGym)}</div>
          </div>
        }
        visibility={visibility}
        onClickOverlay={() => close()}
      />
    </main>
  );
}

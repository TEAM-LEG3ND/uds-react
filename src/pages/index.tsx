import { useQueryClient } from "@tanstack/react-query";
import { Suspense, useEffect, useRef, useState } from "react";

import GymMarker from "@/components/GymMarker";
import GymPreview from "@/components/GymPreview";
import Map from "@/components/Map";
import Sheet from "@/components/Sheet/Sheet";
import { useSheet } from "@/components/Sheet/Sheet.hooks";
import { useClickOutside } from "@/hooks/use-click-outside";
import useSwipe from "@/hooks/use-swipe";
import classNames from "@/pages/index.module.css";
import { Gym } from "@/types/models";
import { compoundRefs } from "@/utils";

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
  const queryClient = useQueryClient();
  const { visibility, open, close } = useSheet();
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const { targetRef } = useClickOutside<HTMLDivElement>(() => close());
  const { elementRef } = useSwipe<HTMLDivElement>({
    onSwipeUp: () => {
      open(100);
    },
    onSwipeDown: () => {
      if (visibility === 100) open(30);
      else if (visibility === 30) close();
    },
  });

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

  const onChangeBounds = async (boundary: kakao.maps.LatLngBounds) => {
    queryClient.cancelQueries({
      queryKey: ["spots", "current"],
    });
    const swLanLng = boundary.getSouthWest();
    const neLanLng = boundary.getNorthEast();
    const fetchData = async () => {
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

    fetchData();
  };

  const onInitMap = (map: kakao.maps.Map) => {
    const boundary = map.getBounds();
    const swLanLng = boundary.getSouthWest();
    const neLanLng = boundary.getNorthEast();

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
  };

  return (
    <main className={classNames.container}>
      <Map
        center={currentPos}
        onInit={onInitMap}
        onChangeBounds={onChangeBounds}
        className={classNames.kakao_map}
      >
        {gymList.map((gym) => (
          <GymMarker
            key={gym.id}
            gym={gym}
            onClick={(gym) => {
              setSelectedGym(gym);
              open(30);
            }}
          />
        ))}
      </Map>
      <Sheet
        ref={compoundRefs([sheetRef, targetRef, elementRef])}
        content={
          <Suspense fallback={<Loader />}>
            <GymPreview gym={selectedGym} currentCoord={currentPos} />
          </Suspense>
        }
        visibility={visibility}
      />
    </main>
  );
}

function Loader() {
  return <div className={classNames.loader} />;
}

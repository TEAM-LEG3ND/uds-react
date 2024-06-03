import { useQueryClient } from "@tanstack/react-query";
import { Suspense, useRef, useState } from "react";

import { CENTER_OF_SEOUL } from "@/constants";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useCurrentPositionQuery } from "@/hooks/use-geolocation";
import useSwipe from "@/hooks/use-swipe";
import classNames from "@/pages/index.module.css";
import { TGym } from "@/types/models";
import CurrentPositionOverlay from "@/ui/CurrentPositionOverlay";
import GymDetail from "@/ui/GymDetail";
import GymMarker from "@/ui/GymMarker";
import GymPreview from "@/ui/GymPreview";
import Map from "@/ui/Map";
import Sheet from "@/ui/Sheet/Sheet";
import { useSheet } from "@/ui/Sheet/Sheet.hooks";
import { compoundRefs, getCachedCurrentPosition } from "@/utils";

type TSheetLayout = "PREVIEW" | "DETAIL";

export default function HomePage() {
  const { data: currentPosition } = useCurrentPositionQuery(
    getCachedCurrentPosition() ?? CENTER_OF_SEOUL
  );
  const [gymList, setGymList] = useState<TGym[]>([]);
  const [sheetLayout, setSheetLayout] = useState<TSheetLayout>("PREVIEW");
  const [selectedGym, setSelectedGym] = useState<TGym>({
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
      setSheetLayout("DETAIL");
    },
    onSwipeDown: () => {
      if (visibility === 100) {
        open(30);
        setSheetLayout("PREVIEW");
      } else if (visibility === 30) close();
    },
  });

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
            `${import.meta.env.VITE_API_ENDPOINT}/v1/spots/boundary?swlat=${swLanLng.getLat()}&swlng=${swLanLng.getLng()}&nelat=${neLanLng.getLat()}&nelng=${neLanLng.getLng()}`
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
    <>
      <Map
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
              setSheetLayout("PREVIEW");
            }}
          />
        ))}
        <CurrentPositionOverlay
          defaultPos={getCachedCurrentPosition() ?? CENTER_OF_SEOUL}
        />
      </Map>
      <Sheet
        ref={compoundRefs([sheetRef, targetRef, elementRef])}
        content={
          <Suspense fallback={<Loader />}>
            {sheetLayout === "PREVIEW" ? (
              <GymPreview gym={selectedGym} currentCoord={currentPosition} />
            ) : (
              <GymDetail gym={selectedGym} currentCoord={currentPosition} />
            )}
          </Suspense>
        }
        visibility={visibility}
      />
    </>
  );
}

function Loader() {
  return <div className={classNames.loader} />;
}

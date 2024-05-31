import { useQueryClient } from "@tanstack/react-query";
import { Suspense, useRef, useState } from "react";
import { Await, useLoaderData } from "react-router-dom";

import Avatar from "@/components/avatar/Avatar";
import CurrentPositionOverlay from "@/components/CurrentPositionOverlay";
import GymDetail from "@/components/GymDetail";
import GymMarker from "@/components/GymMarker";
import GymPreview from "@/components/GymPreview";
import Map from "@/components/Map";
import Sheet from "@/components/Sheet/Sheet";
import { useSheet } from "@/components/Sheet/Sheet.hooks";
import { CENTER_OF_SEOUL } from "@/constants";
import { parseEnv } from "@/effects/apis";
import { GetAuthMeResponse } from "@/effects/apis.model";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useCurrentPositionQuery } from "@/hooks/use-geolocation";
import useSwipe from "@/hooks/use-swipe";
import classNames from "@/pages/index.module.css";
import { TGym } from "@/types/models";
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
  const { me } = useLoaderData() as { me: Promise<GetAuthMeResponse> };

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
    <div>
      <header className={classNames.gnb}>
        <Suspense fallback={<div></div>}>
          <Await
            resolve={me}
            errorElement={
              <a
                href={parseEnv(
                  `${import.meta.env.VITE_API_ENDPOINT}/auth/login`
                )}
              >
                로그인
              </a>
            }
            children={(resolvedMe) => <Avatar src={resolvedMe.picture} />}
          />
        </Suspense>
      </header>
      <main className={classNames.container}>
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
      </main>
    </div>
  );
}

function Loader() {
  return <div className={classNames.loader} />;
}

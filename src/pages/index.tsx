import { Suspense, useRef, useState } from "react";

import { CENTER_OF_SEOUL } from "@/constants";
import { useSpotsBoundaryAsyncQuery } from "@/effects/apis";
import { useMyPositionWatcher } from "@/effects/geolocation";
import Map from "@/features/map/Map";
import MyPositionTracker from "@/features/map/MyPositionTracker";
import GymDetail from "@/features/spot/GymDetail";
import GymMarker from "@/features/spot/GymMarker";
import GymPreview from "@/features/spot/GymPreview";
import { useClickOutside } from "@/hooks/use-click-outside";
import useSwipe from "@/hooks/use-swipe";
import { TBoundary } from "@/models/map";
import { TGym } from "@/models/spot";
import classNames from "@/pages/index.module.css";
import Sheet from "@/ui/sheet";
import { useSheet } from "@/ui/sheet/hooks";
import { compoundRefs, getMyPositionCache } from "@/utils";

type TSheetLayout = "PREVIEW" | "DETAIL";

const initialPosition = getMyPositionCache() ?? CENTER_OF_SEOUL;

export default function HomePage() {
  const { myPosition } = useMyPositionWatcher(initialPosition);
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
  const { getSpotsBoundaryAsync } = useSpotsBoundaryAsyncQuery();

  const onChangeBounds = async (boundary: TBoundary) => {
    const gymList = await getSpotsBoundaryAsync(boundary);
    setGymList(gymList);
  };

  const onInitMap = async (map: kakao.maps.Map) => {
    const bounds = map.getBounds();
    const swLatLng = bounds.getSouthWest();
    const neLatLng = bounds.getNorthEast();
    const boundary: TBoundary = {
      swlat: swLatLng.getLat(),
      swlng: swLatLng.getLng(),
      nelat: neLatLng.getLat(),
      nelng: neLatLng.getLng(),
    };

    const gymList = await getSpotsBoundaryAsync(boundary);
    setGymList(gymList);
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
        <MyPositionTracker
          initialPosition={initialPosition}
          myPosition={myPosition}
        />
      </Map>
      <Sheet
        ref={compoundRefs([sheetRef, targetRef, elementRef])}
        content={
          <Suspense fallback={<Loader />}>
            {sheetLayout === "PREVIEW" ? (
              <GymPreview gym={selectedGym} currentCoord={myPosition} />
            ) : (
              <GymDetail gym={selectedGym} currentCoord={myPosition} />
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

import { useEffect, useState } from "react";

import { useMyPositionWatcher } from "@/effects/geolocation";
import { useMap } from "@/features/map/MapProvider";
import { TPosition } from "@/models/spot";

import classNames from "./MyLocationTracker.module.css";

interface Props {
  defaultPos: TPosition;
}

export default function MyLocationTracker({ defaultPos }: Props) {
  const map = useMap();
  const { myPosition } = useMyPositionWatcher(defaultPos);
  const [overlay, setOverlay] = useState<kakao.maps.CustomOverlay | null>(null);

  useEffect(() => {
    if (!map) return;
    const content = `<div class=${classNames.overlay} />`;

    const myLocationTracker = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(
        defaultPos.latitude,
        defaultPos.longitude
      ),
      content: content,
      clickable: false,
      zIndex: 1,
    });

    setOverlay(myLocationTracker);
    myLocationTracker.setMap(map);
  }, [defaultPos.latitude, defaultPos.longitude, map]);

  useEffect(() => {
    if (!overlay) return;

    overlay.setPosition(
      new kakao.maps.LatLng(myPosition.latitude, myPosition.longitude)
    );
  }, [overlay, myPosition.latitude, myPosition.longitude]);

  return null;
}

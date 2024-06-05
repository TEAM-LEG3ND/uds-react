import { useEffect, useRef } from "react";

import { useMap } from "@/features/map/MapProvider";
import { TPosition } from "@/models/spot";

import classNames from "./MyPositionTracker.module.css";

interface Props {
  initialPosition: TPosition;
  myPosition: TPosition;
}

export default function MyPositionTracker({
  initialPosition,
  myPosition,
}: Props) {
  const map = useMap();
  const trackerRef = useRef<kakao.maps.CustomOverlay>(
    new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(
        initialPosition.latitude,
        initialPosition.longitude
      ),
      content: `<div class=${classNames.overlay} />`,
      clickable: false,
      zIndex: 1,
    })
  );

  useEffect(() => {
    if (!map) return;
    const tracker = trackerRef.current;

    tracker.setMap(map);

    return () => {
      tracker.setMap(null);
    };
  }, [map]);

  useEffect(() => {
    trackerRef.current.setPosition(
      new kakao.maps.LatLng(myPosition.latitude, myPosition.longitude)
    );
  }, [myPosition.latitude, myPosition.longitude]);

  return null;
}

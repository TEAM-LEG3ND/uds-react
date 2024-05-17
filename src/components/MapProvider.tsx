import { createContext, ReactNode, useContext } from "react";

const MapContext = createContext<kakao.maps.Map | null>(null);

export function MapProvider({
  map,
  children,
}: {
  map: kakao.maps.Map | null;
  children: ReactNode;
}) {
  return <MapContext.Provider value={map}>{children}</MapContext.Provider>;
}

export const useMap = () => {
  const map = useContext(MapContext);

  return map;
};

import { useSuspenseQueries } from "@tanstack/react-query";

import { TGym } from "@/models/spot";
import {
  calculateDirectWTMDistance,
  takeTopN,
  translateWGS84ToWTMAsync,
} from "@/utils";

import classNames from "./GymPreview.module.css";

interface Props {
  gym: TGym;
  currentCoord: {
    latitude: number;
    longitude: number;
  };
}

function GymPreview({ gym, currentCoord }: Props) {
  const [{ data: wtmCur }, { data: wtmDest }] = useSuspenseQueries({
    queries: [
      currentCoord,
      { latitude: gym.latitude, longitude: gym.longitude },
    ].map((coord) => ({
      queryKey: ["translate", "coord", coord.latitude, coord.longitude],
      queryFn: () => translateWGS84ToWTMAsync(coord.longitude, coord.latitude),
    })),
  });

  const distanceFromCur = calculateDirectWTMDistance(wtmCur, wtmDest);
  const FACILITY_VISIBLE_COUNT = 6;

  return (
    <div className={classNames.container}>
      <header>
        <h3 className={classNames.title}>{gym.name}</h3>
        <small className={classNames.subtitle}>{gym.description}</small>
      </header>
      <section className={classNames.address_container}>
        <p className={classNames.distance}>{`${distanceFromCur}m`}</p>
        {gym.address}
      </section>
      <section className={classNames.facility_list_container}>
        <ul className={classNames.facility_list}>
          {takeTopN(gym.facilities, FACILITY_VISIBLE_COUNT).map((facility) => (
            <li key={facility.id}>
              <button type="button" className={classNames.facility_tag}>
                {facility.name}
              </button>
            </li>
          ))}
          {gym.facilities.length > FACILITY_VISIBLE_COUNT ? (
            <li key={crypto.randomUUID()}>
              <button type="button" className={classNames.facility_tag}>
                외 {gym.facilities.length - FACILITY_VISIBLE_COUNT}개
              </button>
            </li>
          ) : null}
        </ul>
      </section>
      <footer className={classNames.footer}>
        <a
          href={`https://map.kakao.com/link/to/${gym.name},${gym.latitude},${gym.longitude}`}
          target="_blank"
          className={classNames.action_btn}
        >
          길찾기
        </a>
      </footer>
    </div>
  );
}

export default GymPreview;

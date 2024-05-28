import { useSuspenseQueries } from "@tanstack/react-query";

import classNames from "@/components/GymPreview.module.css";
import { TFacility, TGym } from "@/types/models";
import { calculateDirectWTMDistance, takeTopN } from "@/utils";

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
          {takeTopN<TFacility>(gym.facilities, 5).map((facility) => (
            <li key={facility.id}>
              <div className={classNames.facility_card}></div>
            </li>
          ))}
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

const translateWGS84ToWTMAsync = (x: number, y: number) => {
  const geocoder = new kakao.maps.services.Geocoder();

  return new Promise<{ x: number; y: number }>((resolve, reject) => {
    geocoder.transCoord(
      x,
      y,
      ([res], status) => {
        if (status === kakao.maps.services.Status.ERROR)
          reject("translation failed");
        else resolve(res);
      },
      {
        input_coord: kakao.maps.services.Coords.WGS84,
        output_coord: kakao.maps.services.Coords.WTM,
      }
    );
  });
};

export default GymPreview;

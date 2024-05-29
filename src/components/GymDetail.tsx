import { useSuspenseQueries } from "@tanstack/react-query";
import { MapPin } from "lucide-react";

import classNames from "@/components/GymDetail.module.css";
import { TGym, TPosition } from "@/types/models";
import { calculateDirectWTMDistance, translateWGS84ToWTMAsync } from "@/utils";

interface Props {
  gym: TGym;
  currentCoord: TPosition;
}

export default function GymDetail({ gym, currentCoord }: Props) {
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
    <main className={classNames.container}>
      <section className={classNames.photo_frame_container}>
        <PhotoFrame />
      </section>
      <div className={classNames.content_container}>
        <header>
          <h3 className={classNames.title}>{gym.name}</h3>
          <div className={classNames.address_container}>
            <p className={classNames.distance}>{`${distanceFromCur}m`}</p>
            {gym.address}
          </div>
        </header>
        {gym.description && (
          <section className={classNames.description}>
            {gym.description}
          </section>
        )}
        <section className={classNames.action_list}>
          <a
            href={`https://map.kakao.com/link/to/${gym.name},${gym.latitude},${gym.longitude}`}
            target="_blank"
            className={classNames.action_btn}
          >
            <MapPin width={20} height={20} className={classNames.icon} />
            길찾기
          </a>
        </section>
        <Splitter />
        <section className={classNames.facility_list_container}>
          <ul className={classNames.facility_list}>
            {gym.facilities.map((facility) => (
              <li key={facility.id}>
                <button type="button" className={classNames.facility_tag}>
                  {facility.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function Splitter() {
  return <div className={classNames.splitter} />;
}

function PhotoFrame() {
  return <div className={classNames.photo_frame}></div>;
}

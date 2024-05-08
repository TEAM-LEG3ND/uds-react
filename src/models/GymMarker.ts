import { Gym } from "@/types/models";
import { First } from "@/types/util";

export default class GymMarker extends kakao.maps.Marker {
  #gym: Gym;
  constructor(
    gym: Gym,
    markerOtion: First<ConstructorParameters<typeof kakao.maps.Marker>>
  ) {
    super(markerOtion);
    this.#gym = gym;
  }

  getGym() {
    return this.#gym;
  }
}

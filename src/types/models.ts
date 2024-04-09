export type Facility = {
  id: number;
  name: string;
};

export type Gym = {
  id: number;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  facilities: Facility[];
};

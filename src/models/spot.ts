import { z } from "zod";

export const Position = z.object({
  latitude: z.number(),
  longitude: z.number(),
});
export type TPosition = z.infer<typeof Position>;

export const Spot = z
  .object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    address: z.string(),
  })
  .merge(Position);
export type TSpot = z.infer<typeof Spot>;

export const Facility = z.object({
  id: z.number(),
  name: z.string(),
});
export type TFacility = z.infer<typeof Facility>;

export const Gym = Spot.merge(z.object({ facilities: Facility.array() }));
export type TGym = z.infer<typeof Gym>;

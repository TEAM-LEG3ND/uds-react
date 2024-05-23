import { z } from "zod";

export const Facility = z.object({
  id: z.number(),
  name: z.string(),
});
export type TFacility = z.infer<typeof Facility>;

export const Gym = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  facilities: Facility.array(),
});
export type TGym = z.infer<typeof Gym>;

export const Position = z.object({
  latitude: z.number(),
  longitude: z.number(),
});
export type TPosition = z.infer<typeof Position>;

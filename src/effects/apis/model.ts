import { z } from "zod";

import { Boundary } from "@/models/map";

export const getAuthCallbackResponse = z.object({
  name: z.string(),
  picture: z.string(),
});
export type TGetAuthCallbackResponse = z.infer<typeof getAuthCallbackResponse>;

export const getAuthCallbackRequest = z.object({
  state: z.string(),
  code: z.string(),
});
export type TGetAuthCallbackReqeust = z.infer<typeof getAuthCallbackRequest>;

export const getAuthMeResponse = z.object({
  name: z.string(),
  picture: z.string(),
});
export type TGetAuthMeResponse = z.infer<typeof getAuthMeResponse>;

export const getLoginResponse = z.object({
  redirect_uri: z.string(),
});
export type TGetLoginResponse = z.infer<typeof getLoginResponse>;

export const getSpotsResponse = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    address: z.string(),
    description: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    facilities: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    ),
  })
);
export type TGetSpotsResponse = z.infer<typeof getSpotsResponse>;

export const getSpotsBoundaryRequest = Boundary;
export type TGetSpotsBoundaryRequest = z.infer<typeof getSpotsBoundaryRequest>;

export const getSpotsBoundaryResponse = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    address: z.string(),
    description: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    facilities: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    ),
  })
);
export type TGetSpotsBoundaryResponse = z.infer<
  typeof getSpotsBoundaryResponse
>;

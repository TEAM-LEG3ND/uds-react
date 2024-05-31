import { z } from "zod";

export const getAuthCallbackResponse = z.object({
  name: z.string(),
  picture: z.string(),
});
export type GetAuthCallbackResponse = z.infer<typeof getAuthCallbackResponse>;

export const getAuthCallbackRequest = z.object({
  state: z.string(),
  code: z.string(),
});
export type GetAuthCallbackReqeust = z.infer<typeof getAuthCallbackRequest>;

export const getAuthMeResponse = z.object({
  name: z.string(),
  picture: z.string(),
});
export type GetAuthMeResponse = z.infer<typeof getAuthMeResponse>;

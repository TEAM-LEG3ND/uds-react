import { z } from "zod";

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

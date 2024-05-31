import { useQuery } from "@tanstack/react-query";
import ky, { HTTPError } from "ky";

import {
  GetAuthCallbackReqeust,
  GetAuthCallbackResponse,
  getAuthCallbackResponse,
  GetAuthMeResponse,
  getAuthMeResponse,
} from "@/effects/apis.model";

const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
  retry: 0,
});

export const paths = {
  auth: {
    login: "auth/login",
    callback: "auth/callback",
    me: "auth/me",
  },
};

export const parseEnv = (path: string) => {
  switch (import.meta.env.MODE) {
    case "development":
      return `${path}/local`;
    case "production":
      return path;
    default:
      return path;
  }
};

export const keys = {
  auth: {
    login: ["auth", "login"],
    callback: ["auth", "callback"],
    me: ["auth", "me"],
  },
};

export const useLoginQuery = () => {
  return useQuery<unknown, HTTPError, unknown>({
    queryKey: keys.auth.login,
    queryFn: () => getLogin(),
  });
};

export const getLogin = async () => {
  try {
    const res = await api.get(parseEnv(paths.auth.login)).json();

    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const useAuthCallbackQuery = (params: GetAuthCallbackReqeust) => {
  return useQuery<GetAuthCallbackResponse, HTTPError, GetAuthCallbackResponse>({
    queryKey: keys.auth.callback,
    queryFn: () => getAuthCallback(params),
  });
};

export const getAuthCallback = async ({
  state,
  code,
}: GetAuthCallbackReqeust) => {
  try {
    const res = await api
      .get(parseEnv(paths.auth.callback), {
        searchParams: {
          state,
          code,
        },
      })
      .json();
    const auth = getAuthCallbackResponse.parse(res);

    return auth;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const useAuthMeQuery = () => {
  return useQuery<GetAuthMeResponse, HTTPError, GetAuthMeResponse>({
    queryKey: keys.auth.me,
    queryFn: () => getAuthMe(),
  });
};

export const getAuthMe = async () => {
  try {
    const res = await api.get(paths.auth.me).json();
    const me = getAuthMeResponse.parse(res);

    return me;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

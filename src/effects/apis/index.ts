import { useQuery } from "@tanstack/react-query";
import ky, { HTTPError } from "ky";

import {
  getAuthCallbackResponse,
  getAuthMeResponse,
  getLoginResponse,
  TGetAuthCallbackReqeust,
  TGetAuthCallbackResponse,
  TGetAuthMeResponse,
} from "@/effects/apis/model";

const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
  retry: 0,
});

const paths = {
  auth: {
    login: "v2/auth/login",
    callback: "v1/auth/callback",
    me: "v1/auth/me",
  },
};

const parseEnv = (path: string) => {
  switch (import.meta.env.MODE) {
    case "development":
      return `${path}/local`;
    case "production":
      return path;
    default:
      return path;
  }
};

const keys = {
  auth: {
    login: ["auth", "login"],
    callback: ["auth", "callback"],
    me: ["auth", "me"],
  },
};

export const useAuthLoginQuery = () => {
  return useQuery<unknown, HTTPError, unknown>({
    queryKey: keys.auth.login,
    queryFn: () => getAuthLogin(),
  });
};

export const getAuthLogin = async () => {
  try {
    const res = await api.get(parseEnv(paths.auth.login)).json();
    const login = getLoginResponse.parse(res);

    return login;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const useAuthCallbackQuery = (params: TGetAuthCallbackReqeust) => {
  return useQuery<
    TGetAuthCallbackResponse,
    HTTPError,
    TGetAuthCallbackResponse
  >({
    queryKey: keys.auth.callback,
    queryFn: () => getAuthCallback(params),
  });
};

export const getAuthCallback = async ({
  state,
  code,
}: TGetAuthCallbackReqeust) => {
  try {
    const res = await api
      .get(paths.auth.callback, {
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
  return useQuery<TGetAuthMeResponse, HTTPError, TGetAuthMeResponse>({
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

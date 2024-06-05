import { useQuery, useQueryClient } from "@tanstack/react-query";
import ky, { HTTPError } from "ky";

import {
  getAuthCallbackResponse,
  getAuthMeResponse,
  getLoginResponse,
  getSpotsBoundaryResponse,
  getSpotsResponse,
  TGetAuthCallbackReqeust,
  TGetAuthCallbackResponse,
  TGetAuthMeResponse,
  TGetSpotsBoundaryRequest,
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
  spots: {
    index: "v1/spots",
    boundary: "v1/spots/boundary",
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
  spot: {
    index: ["spots"],
    boundary: ({
      swlat,
      swlng,
      nelat,
      nelng,
    }: {
      swlat: number;
      swlng: number;
      nelat: number;
      nelng: number;
    }) => ["spots", "boundary", swlat, swlng, nelat, nelng],
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

export const getSpots = async () => {
  try {
    const res = await api.get(paths.spots.index).json();
    const spots = getSpotsResponse.parse(res);

    return spots;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getSpotsBoundary = async (params: TGetSpotsBoundaryRequest) => {
  try {
    const res = await api
      .get(paths.spots.index, {
        searchParams: params,
      })
      .json();
    const spots = getSpotsBoundaryResponse.parse(res);

    return spots;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const useSpotsBoundaryQuery = (params: TGetSpotsBoundaryRequest) => {
  return useQuery({
    queryKey: keys.spot.boundary(params),
    queryFn: () => getSpotsBoundary(params),
  });
};

export const useSpotsBoundaryAsyncQuery = () => {
  const queryClient = useQueryClient();

  return {
    getSpotsBoundaryAsync: (params: TGetSpotsBoundaryRequest) =>
      queryClient.fetchQuery({
        queryKey: keys.spot.boundary(params),
        queryFn: () => getSpotsBoundary(params),
      }),
  };
};

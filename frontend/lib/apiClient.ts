import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getApiBase } from "./config";

const ACCESS_KEY = "lms_access_token";

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function setStoredAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(ACCESS_KEY, token);
  else localStorage.removeItem(ACCESS_KEY);
}

export const apiClient = axios.create({
  baseURL: getApiBase(),
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const status = error.response?.status;
    if (status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }
    if (original.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      const refresh = await axios.post(`${getApiBase()}/auth/refresh`, {}, { withCredentials: true });
      const accessToken = (refresh.data as { accessToken: string }).accessToken;
      setStoredAccessToken(accessToken);
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(original);
    } catch {
      setStoredAccessToken(null);
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth/login";
      }
      return Promise.reject(error);
    }
  }
);

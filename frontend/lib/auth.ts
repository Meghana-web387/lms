import { apiClient, setStoredAccessToken } from "./apiClient";

export type User = { id: string; email: string; name: string };

export async function loginRequest(email: string, password: string): Promise<{
  accessToken: string;
  user: User;
}> {
  const { data } = await apiClient.post<{ accessToken: string; user: User }>("/auth/login", {
    email,
    password,
  });
  setStoredAccessToken(data.accessToken);
  return data;
}

export async function registerRequest(
  email: string,
  password: string,
  name: string
): Promise<{ accessToken: string; user: User }> {
  const { data } = await apiClient.post<{ accessToken: string; user: User }>("/auth/register", {
    email,
    password,
    name,
  });
  setStoredAccessToken(data.accessToken);
  return data;
}

export async function logoutRequest(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    setStoredAccessToken(null);
  }
}

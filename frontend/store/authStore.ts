import { create } from "zustand";
import { getStoredAccessToken, setStoredAccessToken } from "@/lib/apiClient";
import type { User } from "@/lib/auth";

function parseAccessJwt(token: string): User | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/"))) as {
      sub?: string;
      email?: string;
      name?: string;
    };
    if (!json.sub || !json.email) return null;
    return { id: json.sub, email: json.email, name: json.name ?? "" };
  } catch {
    return null;
  }
}

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  setSession: (user: User, accessToken: string) => void;
  clearSession: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setSession: (user, accessToken) => {
    setStoredAccessToken(accessToken);
    set({ user, isAuthenticated: true });
  },
  clearSession: () => {
    setStoredAccessToken(null);
    set({ user: null, isAuthenticated: false });
  },
  hydrate: () => {
    const token = getStoredAccessToken();
    if (!token) {
      set({ user: null, isAuthenticated: false });
      return;
    }
    const user = parseAccessJwt(token);
    set({ user, isAuthenticated: !!user });
  },
}));

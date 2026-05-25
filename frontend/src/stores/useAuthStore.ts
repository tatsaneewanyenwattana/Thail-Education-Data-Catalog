import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "@/services/api";

export type User = {
  id: string;
  email: string;
  role: "visitor" | "agency" | "admin";
  status: "pending" | "active" | "rejected" | "suspended";
  agency_name: string | null;
};

type AuthState = {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  initAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => {
        localStorage.setItem("token", token);
        set({ token, user });
      },
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("auth");
        set({ token: null, user: null });
      },
      initAuth: async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          set({ token: null, user: null });
          return;
        }
        set({ token });
        try {
          const res = await apiClient.get("/auth/me");
          const me = (res.data as { data?: User }).data;
          if (!me) {
            throw new Error("no user");
          }
          set({
            token,
            user: {
              id: String(me.id),
              email: me.email,
              role: me.role,
              status: me.status,
              agency_name: me.agency_name,
            },
          });
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("auth");
          set({ token: null, user: null });
        }
      },
    }),
    { name: "auth" }
  )
);

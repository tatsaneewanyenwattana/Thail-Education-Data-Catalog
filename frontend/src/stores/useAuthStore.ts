import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  initAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (token, user) => {
        localStorage.setItem("token", token);
        set({ token, user });
      },
      logout: () => {
        localStorage.removeItem("token");
        set({ token: null, user: null });
      },
      initAuth: () => {
        const token = localStorage.getItem("token");
        if (token) {
          set({ token });
        }
      },
    }),
    { name: "auth" }
  )
);

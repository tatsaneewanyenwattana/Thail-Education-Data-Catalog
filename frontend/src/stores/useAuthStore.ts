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
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  initAuth: () => Promise<void>;
};

function mapMeToUser(me: User): User {
  return {
    id: String(me.id),
    email: me.email,
    role: me.role,
    status: me.status,
    agency_name: me.agency_name,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
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
        const storedToken = localStorage.getItem("token");
        const { token: stateToken, user: stateUser } = get();

        if (!storedToken) {
          set({ token: null, user: null });
          return;
        }

        if (stateToken && stateUser) {
          set({ token: stateToken });
          return;
        }

        set({ token: storedToken });
        try {
          const res = await apiClient.get("/auth/me");
          const me = (res.data as { data?: User }).data;
          if (!me) {
            throw new Error("no user");
          }
          set({
            token: storedToken,
            user: mapMeToUser(me),
          });
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("auth");
          set({ token: null, user: null });
        }
      },
    }),
    {
      name: "auth",
      skipHydration: true,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

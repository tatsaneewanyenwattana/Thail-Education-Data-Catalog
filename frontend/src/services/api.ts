import axios, { AxiosError, AxiosResponse } from "axios";

type JSendError = {
  code: string;
  message: string;
};

type JSendResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: JSendError;
};

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse<JSendResponse>) => {
    if (response.data?.success === true) {
      return response;
    }

    if (response.data?.success === false) {
      const err = new Error(response.data.error?.message ?? "Request failed");
      (err as Error & { code?: string }).code = response.data.error?.code;
      throw err;
    }

    return response;
  },
  (error: AxiosError<JSendResponse>) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url ?? "";
      const isLoginRequest = requestUrl.includes("/auth/login");

      if (!isLoginRequest && typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("auth");
        const locale = localStorage.getItem("locale") || "th";
        const pathLocale =
          window.location.pathname.split("/")[1] === "en" ? "en" : locale;
        window.location.href = `/${pathLocale}/login`;
      }
    }

    if (error.response?.status === 429) {
      const err = new Error("RATE_LIMIT_EXCEEDED");
      (err as Error & { code?: string }).code = "RATE_LIMIT_EXCEEDED";
      throw err;
    }

    if (error.response?.data?.success === false) {
      const apiErr = new Error(
        error.response.data.error?.message ?? "Request failed"
      );
      (apiErr as Error & { code?: string }).code =
        error.response.data.error?.code;
      throw apiErr;
    }

    throw error;
  }
);

export default apiClient;

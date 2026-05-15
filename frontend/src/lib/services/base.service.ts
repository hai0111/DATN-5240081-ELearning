import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export class BaseService {
  protected http: AxiosInstance;

  constructor(basePath: string = "") {
    this.http = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5292"}${basePath}`,
      headers: { "Content-Type": "application/json" },
    });

    // Attach JWT token to every request
    this.http.interceptors.request.use((config) => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    // Unwrap response data; redirect to login on 401
    this.http.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response?.status === 401 && typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      },
    );
  }

  protected get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.http.get<T>(url, config).then((r: AxiosResponse<T>) => r.data);
  }

  protected post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.http.post<T>(url, data, config).then((r: AxiosResponse<T>) => r.data);
  }

  protected put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.http.put<T>(url, data, config).then((r: AxiosResponse<T>) => r.data);
  }

  protected patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.http.patch<T>(url, data, config).then((r: AxiosResponse<T>) => r.data);
  }

  protected delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.http.delete<T>(url, config).then((r: AxiosResponse<T>) => r.data);
  }
}

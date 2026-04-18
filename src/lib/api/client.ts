import { ApiResponse } from "@core/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://cyan-partridge-132677.hostingersite.com/api/api.php";

export class ApiError extends Error {
  constructor(public message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiClient = {
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(BASE_URL);
    url.searchParams.append("action", endpoint);
    if (params) {
      Object.entries(params).forEach(([key, val]) => url.searchParams.append(key, val));
    }

    const response = await fetch(url.toString(), {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.error || "Erro na requisição", response.status);
    }

    return response.json();
  },

  async post<T>(endpoint: string, body: any): Promise<T> {
    const url = new URL(BASE_URL);
    url.searchParams.append("action", endpoint);

    const isFormData = body instanceof FormData;

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: isFormData ? {} : {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: isFormData ? body : JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.error || "Erro na requisição", response.status);
    }

    return response.json();
  },
};



// services/bot.ts
import type {
  BotsApiResponse,
  BotApiResponse,
  CreateBotRequest,
  UpdateBotRequest,
  DeleteBotResponse,
  ApiError,
} from "@/types/bot";
import { getApiUrl, API_CONFIG } from "@/config/api";
import { StorageService } from "@/lib/storage";

/**
 * Helper: parse backend error message from a Response or parsed JSON
 */
async function extractErrorMessageFromResponse(res: Response) {
  try {
    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    if (contentType.includes("application/json")) {
      const payload = await res.json();
      if (payload?.message) return String(payload.message);
      if (payload?.error) return String(payload.error);
      // Express-validator style errors
      if (payload?.errors) {
        if (Array.isArray(payload.errors) && payload.errors.length > 0) {
          const first = payload.errors[0];
          return first?.msg ?? first?.message ?? JSON.stringify(first);
        }
        return JSON.stringify(payload.errors);
      }
      return JSON.stringify(payload);
    } else {
      const text = await res.text().catch(() => "");
      return text || `Request failed with status ${res.status}`;
    }
  } catch (e) {
    try {
      const text = await res.text().catch(() => "");
      if (text) return text;
    } catch {}
    return `Request failed with status ${res.status}`;
  }
}

function getAuthHeaders() {
  const token = StorageService.getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export const BotService = {
  async getBots(
    page: number = 1,
    perPage: number = 10,
    query?: string,
    status?: string
  ): Promise<BotsApiResponse> {
    try {
      // Use backend params format consistent with your other services (p, n)
      const params = new URLSearchParams({
        p: String(page),
        n: String(perPage),
      });
      if (query && query.trim()) params.append("q", query.trim());
      if (status) params.append("status", status);

      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.BOT)}?${params.toString()}`;
      const res = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const json = await res.json();
      if (!res.ok) {
        const msg = (json && json.message) || (await extractErrorMessageFromResponse(res));
        throw new Error(msg || `Failed to fetch bots (status ${res.status})`);
      }

      // Normalize response shapes
      const raw = json?.data ?? json?.bots ?? json ?? [];
      const mapped = Array.isArray(raw) ? raw : [];

      const normalized: BotsApiResponse = {
        data: mapped,
        totalPages: json.totalPages ?? json.pages ?? Math.ceil((json.totalBots ?? json.totalItems ?? mapped.length) / (perPage || 10)),
        totalItems: json.totalItems ?? json.totalBots ?? json.total ?? mapped.length,
        page: json.page ?? page,
        perPage: json.perPage ?? perPage,
      };

      return normalized;
    } catch (err: any) {
      throw { message: err?.message ?? "Failed to fetch bots" } as ApiError;
    }
  },

  async createBot(data: CreateBotRequest): Promise<BotApiResponse> {
    try {
      const res = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.BOT), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        const msg = json?.message ?? (await extractErrorMessageFromResponse(res));
        throw new Error(msg || `Create bot failed (status ${res.status})`);
      }

      // backend shape: { status: 'success', data: bot }
      return (json?.data ?? json) as BotApiResponse;
    } catch (err: any) {
      throw { message: err?.message ?? "Failed to create bot" } as ApiError;
    }
  },

  async updateBot(id: string, data: UpdateBotRequest): Promise<BotApiResponse> {
    try {
      const res = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.BOT)}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        const msg = json?.message ?? (await extractErrorMessageFromResponse(res));
        throw new Error(msg || `Update bot failed (status ${res.status})`);
      }

      return (json?.data ?? json) as BotApiResponse;
    } catch (err: any) {
      throw { message: err?.message ?? "Failed to update bot" } as ApiError;
    }
  },

  async deleteBot(id: string): Promise<DeleteBotResponse> {
    try {
      const res = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.BOT)}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = json?.message ?? (await extractErrorMessageFromResponse(res));
        throw new Error(msg || `Delete bot failed (status ${res.status})`);
      }

      // If backend returns `{ status: 'success', data: ... }` then return that data or success.
      return (json ?? { success: true, message: "Deleted" }) as DeleteBotResponse;
    } catch (err: any) {
      throw { message: err?.message ?? "Failed to delete bot" } as ApiError;
    }
  },

  async deleteMultipleBots(ids: string[]): Promise<DeleteBotResponse> {
    try {
      // If backend has no bulk endpoint, call individual deletions
      const results = await Promise.allSettled(
        ids.map((id) =>
          fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.BOT)}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
          })
        )
      );

      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) {
        throw new Error(`Failed to delete ${failed} of ${ids.length} bots`);
      }

      return { success: true, message: "Deleted selected bots" } as DeleteBotResponse;
    } catch (err: any) {
      throw { message: err?.message ?? "Failed to delete bots" } as ApiError;
    }
  },
};

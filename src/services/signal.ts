// services/signal.ts
import type {
  SignalsApiResponse,
  SignalApiResponse,
  CreateSignalRequest,
  UpdateSignalRequest,
  DeleteSignalResponse,
  ApiError,
  RawSignal,
  Signal,
} from "@/types/signal";
import { getApiUrl, API_CONFIG } from "@/config/api";
import { StorageService } from "@/lib/storage";

/* ---------------------------- helpers ----------------------------------- */
async function extractErrorMessageFromResponse(res: Response) {
  try {
    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    if (contentType.includes("application/json")) {
      const payload = await res.json();
      if (payload?.message) return String(payload.message);
      if (payload?.error) return String(payload.error);
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
  } catch {
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

function idFrom(raw: any): string {
  if (!raw) return "";
  if (typeof raw._id === "string") return raw._id;
  if (raw._id?.$oid) return raw._id.$oid;
  if (typeof raw.id === "string") return raw.id;
  if (typeof raw.id?.$oid === "string") return raw.id.$oid;
  if (typeof raw.toString === "function") return raw.toString();
  return "";
}

// function normalizeSignal(raw: RawSignal): Signal {
//   const id = idFrom(raw);
//   const userId =
//     typeof raw.userId === "string"
//       ? raw.userId
//       : (raw.userId as any)?.$oid ?? (raw.userId as any)?.toString?.();
//   const botId =
//     typeof raw.botId === "string"
//       ? raw.botId
//       : (raw.botId as any)?.$oid ?? (raw.botId as any)?.toString?.();

//   return {
//     id: id || raw.id || "",
//     userId,
//     lotSize: raw.lotSize,
//     stopLossPrice: raw.stopLossPrice,
//     targetPrice: raw.targetPrice,
//     botId,
//     tradeId: raw.tradeId,
//     direction:
//       (raw.direction as any)?.toUpperCase?.() === "SHORT" ? "SHORT" : "LONG",
//     signalTime: raw.signalTime ? String(raw.signalTime) : undefined,
//     entryTime: raw.entryTime ? String(raw.entryTime) : undefined,
//     entryPrice: raw.entryPrice,
//     stoploss: raw.stoploss,
//     target1r: raw.target1r,
//     target2r: raw.target2r,
//     exitTime: raw.exitTime ? String(raw.exitTime) : undefined,
//     exitPrice: raw.exitPrice,
//     exitReason: raw.exitReason,
//     profitLoss: raw.profitLoss,
//     profitLossR: raw.profitLossR,
//     trailCount: raw.trailCount,
//     pairName: raw.pairName,
//     createdAt: raw.createdAt ? String((raw.createdAt as any)?.$date ?? raw.createdAt) : undefined,
//     updatedAt: raw.updatedAt ? String((raw.updatedAt as any)?.$date ?? raw.updatedAt) : undefined,
//   };
// }

function normalizeSignal(raw: RawSignal): Signal {
  const id = idFrom(raw);

  return {
    id: id || raw.id || "",
    userId: raw.userId ? String(raw.userId) : undefined,
    botId: raw.bot?.id || "",
    botName: raw.bot?.name || "",   // ✅ bot name extract karo
    tradeId: raw.tradeId,
    direction: raw.direction?.toUpperCase() === "SHORT" ? "SHORT" : "LONG",
    pairName: raw.pairName,
    signalTime: raw.signalTime ? String(raw.signalTime) : undefined,
    entryTime: raw.entryTime ? String(raw.entryTime) : undefined,
    entryPrice: raw.entryPrice,
    stoploss: raw.stoploss,
    target1r: raw.target1r,
    target2r: raw.target2r,
    exitTime: raw.exitTime ? String(raw.exitTime) : undefined,
    exitPrice: raw.exitPrice,
    exitReason: raw.exitReason,
    profitLoss: raw.profitLoss,
    profitLossR: raw.profitLossR,
    trailCount: raw.trailCount,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  };
}


/* ------------------------------ service ---------------------------------- */
export const SignalService = {
  async getSignals(
    page: number = 1,
    perPage: number = 10,
    query?: string,
    direction?: "LONG" | "SHORT",
    botId?: string
  ): Promise<SignalsApiResponse> {
    try {
      const params = new URLSearchParams({
        p: String(page),
        n: String(perPage),
      });
      if (query && query.trim()) params.append("q", query.trim());
      if (direction) params.append("direction", direction);
      if (botId) params.append("botId", botId);

      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.SIGNAL)}?${params.toString()}`;
      const res = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const json = await res.json();
      if (!res.ok) {
        const msg = json?.message ?? (await extractErrorMessageFromResponse(res));
        throw new Error(msg || `Failed to fetch signals (status ${res.status})`);
      }

      console.log(json)

      const rawList = (json?.data ?? json?.signals ?? json ?? []) as RawSignal[];
      const mapped = Array.isArray(rawList) ? rawList.map(normalizeSignal) : [];

      const normalized: SignalsApiResponse = {
        data: mapped,
        totalPages:
          json.totalPages ??
          json.pages ??
          Math.ceil((json.totalItems ?? mapped.length) / (perPage || 10)),
        totalItems: json.totalItems ?? json.total ?? mapped.length,
        page: json.page ?? page,
        perPage: json.perPage ?? perPage,
      };

      return normalized;
    } catch (err: any) {
      throw { message: err?.message ?? "Failed to fetch signals" } as ApiError;
    }
  },

  async createSignal(data: CreateSignalRequest): Promise<SignalApiResponse> {
    try {
      const res = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SIGNAL), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        const msg = json?.message ?? (await extractErrorMessageFromResponse(res));
        throw new Error(msg || `Create signal failed (status ${res.status})`);
      }

      const entity = json?.data ?? json;
      return { data: normalizeSignal(entity as RawSignal), success: true } as SignalApiResponse;
    } catch (err: any) {
      throw { message: err?.message ?? "Failed to create signal" } as ApiError;
    }
  },

  async updateSignal(id: string, data: UpdateSignalRequest): Promise<SignalApiResponse> {
    try {
      const res = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.SIGNAL)}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        const msg = json?.message ?? (await extractErrorMessageFromResponse(res));
        throw new Error(msg || `Update signal failed (status ${res.status})`);
      }

      const entity = json?.data ?? json;
      return { data: normalizeSignal(entity as RawSignal), success: true } as SignalApiResponse;
    } catch (err: any) {
      throw { message: err?.message ?? "Failed to update signal" } as ApiError;
    }
  },

  async deleteSignal(id: string): Promise<DeleteSignalResponse> {
    try {
      const res = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.SIGNAL)}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = json?.message ?? (await extractErrorMessageFromResponse(res));
        throw new Error(msg || `Delete signal failed (status ${res.status})`);
      }

      return (json ?? { success: true, message: "Deleted" }) as DeleteSignalResponse;
    } catch (err: any) {
      throw { message: err?.message ?? "Failed to delete signal" } as ApiError;
    }
  },

  async deleteMultipleSignals(ids: string[]): Promise<DeleteSignalResponse> {
    try {
      const results = await Promise.allSettled(
        ids.map((id) =>
          fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.SIGNAL)}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
          })
        )
      );

      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) {
        throw new Error(`Failed to delete ${failed} of ${ids.length} signals`);
      }

      return { success: true, message: "Deleted selected signals" } as DeleteSignalResponse;
    } catch (err: any) {
      throw { message: err?.message ?? "Failed to delete signals" } as ApiError;
    }
  },
};

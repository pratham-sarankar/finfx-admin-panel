// types/bot.ts
// Robust types for Bot service + API responses.
// These types intentionally accept multiple common backend shapes
// (e.g. `_id.$oid`, `createdAt.$date`, wrapper objects with `success/message`)
// so your service layer can normalize them safely.

export type IDLike =
  | string
  | { $oid?: string }
  | { toString?: () => string };

export type DateLike = string | { $date?: string };

/**
 * RawBot
 * The raw shape we might receive from the backend (Mongo-ish or normalized).
 * Keep fields optional because different endpoints / versions may return
 * different subsets.
 */
export interface RawBot {
  _id?: IDLike;
  id?: string;
  name?: string;
  description?: string;
  recommendedCapital?: number;
  recommended_capital?: number;
  performanceDuration?: string;
  performance_duration?: string;
  script?: string;
  currency?: string;
  status?: "active" | "inactive" | string;
  createdAt?: DateLike;
  updatedAt?: DateLike;
  // allow other backend-specific fields without breaking typings
  [key: string]: any;
}

/**
 * Bot
 * Normalized shape used inside the frontend after the service normalizes RawBot.
 */
export interface Bot {
  id: string;
  name: string;
  description?: string;
  recommendedCapital?: number;
  performanceDuration?: string; // expected values like "1D","1W","1M","3M","6M","1Y","ALL"
  script?: string;
  currency?: string;
  status?: "active" | "inactive";
  createdAt?: string; // ISO string
  updatedAt?: string; // ISO string
  // any extra fields (safe to include)
  [key: string]: any;
}

/**
 * Paginated list response used by getBots()
 * The service normalizes various backend shapes into this format.
 */
export interface BotsApiResponse {
  data: Bot[]; // normalized items
  totalPages: number;
  totalItems: number;
  page: number;
  perPage: number;
  success?: boolean;
  message?: string;
  // keep raw for debugging if needed
  raw?: any;
}

/**
 * Single bot API response (create/update/get)
 * Many backends wrap created/updated entity in { success, message, data }.
 * Sometimes they return the entity directly — both are accommodated.
 */
export interface BotApiResponse {
  success?: boolean;
  message?: string;
  data?: RawBot | Bot;
  bot?: RawBot | Bot;
  // some APIs return the entity directly without a wrapper
  // (e.g. POST /bots returns the created bot object)
  // so callers should handle both shapes.
  [key: string]: any;
}

/**
 * Request payloads
 */
export interface CreateBotRequest {
  name: string;
  description?: string;
  recommendedCapital?: number;
  performanceDuration?: string;
  script?: string;
  currency?: string;
  status?: "active" | "inactive";
  [key: string]: any;
}

export interface UpdateBotRequest {
  name?: string;
  description?: string;
  recommendedCapital?: number;
  performanceDuration?: string;
  script?: string;
  currency?: string;
  status?: "active" | "inactive";
  [key: string]: any;
}

/**
 * Delete response
 */
export interface DeleteBotResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}

/**
 * ApiError: thrown by service methods when something goes wrong.
 */
export interface ApiError {
  message: string;
  status?: number;
  errors?: any;
  raw?: any;
}

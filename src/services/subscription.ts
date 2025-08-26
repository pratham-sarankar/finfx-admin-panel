import type {
  SubscriptionsApiResponse,
  SubscriptionApiResponse,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  DeleteSubscriptionResponse,
  ApiError,
} from "@/types/subscription";
import { getApiUrl, API_CONFIG } from "@/config/api";
import { StorageService } from "@/lib/storage";

export class SubscriptionService {
  private static getAuthHeaders() {
    const token = StorageService.getToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  static async getSubscriptions(
    page: number = 1,
    perPage: number = 10,
    query?: string,
    status?: string,
    userId?: string
  ): Promise<SubscriptionsApiResponse> {
    try {
      const params = new URLSearchParams({
        n: perPage.toString(),
        p: page.toString(),
      });
      if (query && query.trim()) params.append("q", query.trim());
      if (status) params.append("status", status);
      if (userId) params.append("userId", userId);

      const response = await fetch(
        `${getApiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION)}?${params.toString()}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Normalize different backend shapes -> return { data, totalPages, totalItems }
      const normalized: SubscriptionsApiResponse = {
        data: result.data || result?.subscriptions || [],
        totalPages:
          result.totalPages ??
          result.pages ??
          Math.ceil((result.totalSubscriptions ?? result.totalItems ?? 0) / (perPage || 10)),
        totalItems: result.totalSubscriptions ?? result.totalItems ?? 0,
        page: result.page ?? page,
        perPage: result.perPage ?? perPage,
      };

      return normalized;
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : "Failed to fetch subscriptions",
      };
      throw apiError;
    }
  }

  static async createSubscription(data: CreateSubscriptionRequest): Promise<SubscriptionApiResponse> {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION), {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create subscription");
      }
      return result;
    } catch (error: any) {
      throw { message: error.message || "Failed to create subscription" } as ApiError;
    }
  }

  static async updateSubscription(id: string, data: UpdateSubscriptionRequest): Promise<SubscriptionApiResponse> {
    try {
      const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION)}/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Failed to update subscription");
      return result;
    } catch (error: any) {
      throw { message: error.message || "Failed to update subscription" } as ApiError;
    }
  }

  static async deleteSubscription(id: string): Promise<DeleteSubscriptionResponse> {
    try {
      const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION)}/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      throw { message: error instanceof Error ? error.message : "Failed to delete subscription" } as ApiError;
    }
  }

  static async deleteMultipleSubscriptions(ids: string[]): Promise<DeleteSubscriptionResponse> {
    try {
      // Backend does not expose a bulk delete endpoint for subscriptions.
      // Perform multiple DELETE calls and aggregate the result.
      const results = await Promise.allSettled(
        ids.map((id) =>
          fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION)}/${id}`, {
            method: "DELETE",
            headers: this.getAuthHeaders(),
          })
        )
      );

      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) {
        throw new Error(`Failed to delete ${failed} of ${ids.length} subscriptions`);
      }

      return { success: true, message: "Deleted selected subscriptions" } as DeleteSubscriptionResponse;
    } catch (error) {
      throw { message: error instanceof Error ? error.message : "Failed to delete subscriptions" } as ApiError;
    }
  }
}



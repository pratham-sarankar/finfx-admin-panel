// export type Subscription = {
//   id: string;
//   user?: { id?: string; fullName?: string; email?: string } | string;
//   bot?: { id?: string; name?: string; description?: string } | string;
//   package?: { id?: string; name?: string; price?: number; duration?: number } | string;
//   lotSize?: number;
//   status?: "active" | "paused" | "expired" | "inactive";
//   subscribedAt?: string; // ISO
//   expiresAt?: string; // ISO
//   createdAt?: string;
//   updatedAt?: string;
// };

// export type CreateSubscriptionRequest = {
//   botId: string;
//   botPackageId: string;
//   lotSize: number;
//   userId?: string;
//   status?: string;
//   expiresAt?: string;
// };


// export type UpdateSubscriptionRequest = Partial<CreateSubscriptionRequest> & {
//   status?: "active" | "paused" | "expired";
//   expiresAt?: string; 
// };


// export type SubscriptionsApiResponse = {
//   // adapt to whatever backend returns; our code handles both shapes
//   data: Subscription[];
//   totalPages?: number;
//   totalItems?: number;
//   totalSubscriptions?: number;
//   page?: number;
//   perPage?: number;
//   success?: boolean;
//   message?: string;
// };

// export type SubscriptionApiResponse = {
//   success: boolean;
//   data: Subscription;
//   message?: string;
// };

// export type DeleteSubscriptionResponse = {
//   success: boolean;
//   message?: string;
// };

// export type ApiError = {
//   message: string;
// };


export type Subscription = {
  id: string;
  user?: { id?: string; fullName?: string; email?: string } | string;
  bot?: { id?: string; name?: string; description?: string } | string;
  package?: { id?: string; name?: string; price?: number; duration?: number } | string;
  lotSize?: number;
  status?: "active" | "paused" | "expired" | "inactive";
  subscribedAt?: string; // ISO
  expiresAt?: string; // ISO
  createdAt?: string;
  updatedAt?: string;
};

export type CreateSubscriptionRequest = {
  botId: string;
  botPackageId: string;
  lotSize: number;
  userId?: string;
  status?: "active" | "paused" | "expired" | "inactive";
  expiresAt?: string;
};

export type UpdateSubscriptionRequest = {
  botId?: string;
  botPackageId?: string;
  lotSize?: number;
  userId?: string;
  status?: "active" | "paused" | "expired" | "inactive";
  expiresAt?: string;
};

export type SubscriptionsApiResponse = {
  data: Subscription[];
  totalPages?: number;
  totalItems?: number;
  totalSubscriptions?: number;
  page?: number;
  perPage?: number;
  success?: boolean;
  message?: string;
};

export type SubscriptionApiResponse = {
  success: boolean;
  data: Subscription;
  message?: string;
};

export type DeleteSubscriptionResponse = {
  success: boolean;
  message?: string;
};


export type ApiError = {
  message: string;
};
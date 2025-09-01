// types/signal.ts

export type IDLike = string | { $oid?: string } | { toString?: () => string };
export type DateLike = string | { $date?: string };

export interface RawSignal {
  _id?: IDLike;
  id?: string;

  userId?: IDLike | string;
  lotSize?: number;
  stopLossPrice?: number;
  targetPrice?: number;
  botId?: IDLike | string;
  tradeId?: string;
  direction?: "LONG" | "SHORT" | "long" | "short" | string;
  signalTime?: DateLike;
  entryTime?: DateLike;
  entryPrice?: number;
  stoploss?: number;
  target1r?: number;
  target2r?: number;
  exitTime?: DateLike;
  exitPrice?: number;
  exitReason?: string;
  profitLoss?: number;
  profitLossR?: number;
  trailCount?: number;
  pairName?: string;

  createdAt?: DateLike;
  updatedAt?: DateLike;

  [key: string]: any;
}

export interface Signal {
  id: string;

  userId?: string;
  lotSize?: number;
  stopLossPrice?: number;
  targetPrice?: number;
  botId?: string;
  tradeId?: string;
  direction?: "LONG" | "SHORT";
  signalTime?: string; // ISO
  entryTime?: string; // ISO
  entryPrice?: number;
  stoploss?: number;
  target1r?: number;
  target2r?: number;
  exitTime?: string; // ISO
  exitPrice?: number;
  exitReason?: string;
  profitLoss?: number;
  profitLossR?: number;
  trailCount?: number;
  pairName?: string;

  createdAt?: string; // ISO
  updatedAt?: string; // ISO

  [key: string]: any;
}

/** Server may return paginated or plain array */
export interface SignalsApiResponse {
  success?: boolean;
  message?: string;

  /** Standard data array */
  data: Signal[];

  /** Case 1: Backend returns top-level pagination */
  totalPages?: number;
  totalItems?: number;
  page?: number;
  perPage?: number;

  /** Case 2: Backend wraps inside `pagination` */
  pagination?: {
    totalPages: number;
    totalSignals?: number; // backend sometimes uses this instead of totalItems
    page: number;
    perPage: number;
  };

  /** Debugging */
  raw?: any;
}

/** Single-signal responses */
export interface SignalApiResponse {
  success?: boolean;
  message?: string;
  data?: RawSignal | Signal;
  signal?: RawSignal | Signal;
  [key: string]: any;
}

/** Create payload — required fields align with your Mongoose model */
export interface CreateSignalRequest {
  userId: string;
  pairName: string;
  direction: "LONG" | "SHORT";
  entryTime: string; // ISO
  entryPrice: number;
  lotSize: number;

  // optional
  botId?: string;
  tradeId?: string;
  signalTime?: string; // ISO
  stopLossPrice?: number;
  targetPrice?: number;
  stoploss?: number;
  target1r?: number;
  target2r?: number;
  exitTime?: string; // ISO
  exitPrice?: number;
  exitReason?: string;
  profitLoss?: number;
  profitLossR?: number;
  trailCount?: number;

  [key: string]: any;
}

export interface UpdateSignalRequest {
  // all optional for partial update
  userId?: string;
  pairName?: string;
  direction?: "LONG" | "SHORT";
  entryTime?: string; // ISO
  entryPrice?: number;
  lotSize?: number;

  botId?: string;
  tradeId?: string;
  signalTime?: string; // ISO
  stopLossPrice?: number;
  targetPrice?: number;
  stoploss?: number;
  target1r?: number;
  target2r?: number;
  exitTime?: string; // ISO
  exitPrice?: number;
  exitReason?: string;
  profitLoss?: number;
  profitLossR?: number;
  trailCount?: number;

  [key: string]: any;
}

export interface DeleteSignalResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: any;
  raw?: any;
}

export type ApiMeta = {
  traceId?: string;
};

export type ApiResponse<TData, TMeta extends ApiMeta | undefined = undefined> = {
  success: true;
  data: TData;
  meta?: TMeta;
};

export function ok<TData>(data: TData): ApiResponse<TData>;
export function ok<TData, TMeta extends ApiMeta>(
  data: TData,
  meta: TMeta,
): ApiResponse<TData, TMeta>;
export function ok<TData, TMeta extends ApiMeta>(data: TData, meta?: TMeta) {
  return {
    success: true as const,
    data,
    ...(meta ? { meta } : {}),
  };
}

export function isApiResponse<TData>(value: unknown): value is ApiResponse<TData> {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    (value as { success?: unknown }).success === true &&
    "data" in value
  );
}

export function unwrapApiResponse<TData>(value: TData | ApiResponse<TData>): TData {
  if (isApiResponse<TData>(value)) {
    return value.data;
  }

  return value;
}

export function ok<TData>(data: TData) {
  return {
    success: true as const,
    data,
  };
}

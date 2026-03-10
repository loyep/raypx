import { Spinner } from "@raypx/design-system/components/ui/spinner";

export function RouteLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  );
}

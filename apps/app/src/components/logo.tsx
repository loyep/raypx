import { cn } from "@raypx/design-system/lib/utils";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <div
      className={cn(
        "flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20",
        className,
      )}
    >
      <span className="font-semibold text-sm tracking-[0.24em]">RX</span>
    </div>
  );
}

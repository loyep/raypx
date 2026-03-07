import { cn } from "@raypx/design-system/lib/utils";

type LogoProps = {
  alt?: string;
  className?: string;
};

export function Logo({ alt = "Raypx", className }: LogoProps) {
  return (
    <picture>
      <source media="(prefers-color-scheme: dark)" srcSet="/logo-dark.png" />
      <img alt={alt} className={cn("size-6 rounded-md", className)} src="/logo.png" />
    </picture>
  );
}

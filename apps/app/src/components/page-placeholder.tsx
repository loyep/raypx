import { Badge } from "@raypx/design-system/components/ui/badge";
import { Button } from "@raypx/design-system/components/ui/button";
import { cn } from "@raypx/design-system/lib/utils";
import { Link } from "@tanstack/react-router";

type PagePlaceholderProps = {
  title: string;
  description: string;
  className?: string;
  kicker?: string;
  primaryAction?: {
    label: string;
    to: "/chat" | "/settings/ai-providers";
  };
};

export function PagePlaceholder({
  title,
  description,
  className,
  kicker = "Placeholder",
  primaryAction,
}: PagePlaceholderProps) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-border/70 bg-card px-6 py-8 shadow-sm sm:px-8 sm:py-10",
        className,
      )}
    >
      <Badge variant="outline">{kicker}</Badge>
      <div className="mt-4 max-w-2xl space-y-3">
        <h1 className="font-semibold text-2xl tracking-tight sm:text-3xl">{title}</h1>
        <p className="text-muted-foreground text-sm leading-6 sm:text-base">{description}</p>
      </div>
      {primaryAction ? (
        <div className="mt-6">
          <Button render={<Link to={primaryAction.to} />}>{primaryAction.label}</Button>
        </div>
      ) : null}
    </section>
  );
}

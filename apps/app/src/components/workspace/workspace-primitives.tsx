import { Badge } from "@raypx/design-system/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/design-system/components/ui/card";
import { cn } from "@raypx/design-system/lib/utils";
import type { ReactNode } from "react";

type WorkspacePageProps = {
  kicker: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

export function WorkspacePage({
  kicker,
  title,
  description,
  children,
  className,
}: WorkspacePageProps) {
  return (
    <section className={cn("mx-auto w-full max-w-6xl space-y-6", className)}>
      <div className="space-y-3">
        <Badge variant="outline">{kicker}</Badge>
        <div className="space-y-1">
          <h1 className="font-semibold text-2xl tracking-tight sm:text-3xl">{title}</h1>
          <p className="max-w-3xl text-muted-foreground text-sm leading-6 sm:text-base">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

type InsightCardProps = {
  title: string;
  value: ReactNode;
  description: string;
};

export function InsightCard({ title, value, description }: InsightCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="font-semibold text-2xl tracking-tight">{value}</p>
        <p className="mt-1 text-muted-foreground text-xs">{description}</p>
      </CardContent>
    </Card>
  );
}

type EmptyStateCardProps = {
  title: string;
  description: string;
  footer?: ReactNode;
};

export function EmptyStateCard({ title, description, footer }: EmptyStateCardProps) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {footer ? <CardContent>{footer}</CardContent> : null}
    </Card>
  );
}

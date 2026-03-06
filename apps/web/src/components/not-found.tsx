import { CompassIcon, HouseLineIcon } from "@phosphor-icons/react";
import { Button } from "@raypx/design-system/components/ui/button";
import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-6 py-24 sm:py-32 lg:px-8">
      {/* Background ambient glow */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-160 w-160 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="fade-in relative z-10 mx-auto max-w-2xl animate-in text-center duration-500">
        {/* Icon */}
        <div className="mb-8 flex items-center justify-center">
          <div className="rounded-full bg-muted/50 p-4 ring-1 ring-border/50">
            <CompassIcon className="size-10 text-muted-foreground" weight="duotone" />
          </div>
        </div>

        {/* 404 Text */}
        <p className="font-semibold text-base text-primary">404 Error</p>

        {/* Title */}
        <h1 className="mt-4 font-bold text-4xl tracking-tight sm:text-6xl">Page not found</h1>

        {/* Subtitle */}
        <p className="mt-6 text-balance text-lg text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't
          exist.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex items-center justify-center gap-x-4">
          <Button render={<Link to="/" />} size="lg">
            <HouseLineIcon className="mr-2 size-5" />
            Back to home
          </Button>
        </div>
      </div>
    </main>
  );
}

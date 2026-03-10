import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(legal)/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="container py-12">
      <h1 className="font-bold text-3xl">Terms of Service</h1>
      <p className="mt-4 text-muted-foreground">Terms of service content will be added here.</p>
    </div>
  );
}

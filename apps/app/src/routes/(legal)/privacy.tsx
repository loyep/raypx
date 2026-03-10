import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(legal)/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="container py-12">
      <h1 className="font-bold text-3xl">Privacy Policy</h1>
      <p className="mt-4 text-muted-foreground">Privacy policy content will be added here.</p>
    </div>
  );
}

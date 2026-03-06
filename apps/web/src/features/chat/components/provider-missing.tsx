import { Button } from "@raypx/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/design-system/components/ui/card";
import { Link } from "@tanstack/react-router";

export function ProviderMissingCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No AI Provider Configured</CardTitle>
        <CardDescription>
          You need to create a provider and set API key before starting chat.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button render={<Link to="/settings/ai-providers" />}>Go to AI Provider Settings</Button>
      </CardContent>
    </Card>
  );
}

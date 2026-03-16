import { authClient } from "@raypx/auth/client";
import { Button } from "@raypx/design-system/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@raypx/design-system/components/ui/dialog";
import {
  FormControl,
  FormDescription,
  FormGroup,
  FormItem,
  FormLabel,
  FormMessage,
  FormTextField,
} from "@raypx/design-system/components/ui/form";
import { Input } from "@raypx/design-system/components/ui/input";
import { IconLayoutGrid } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";

type CreateWorkspaceDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  /** First-time creation (no workspace), cannot be dismissed */
  isFirst?: boolean;
};

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  isFirst = false,
}: CreateWorkspaceDialogProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
    },
    validators: {
      onSubmit: z.object({
        name: z.string().trim().min(1, "Please enter workspace name"),
        slug: z
          .string()
          .trim()
          .min(1, "Please enter workspace slug")
          .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
      }),
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);

      try {
        const { error } = await authClient.organization.create({
          name: value.name.trim(),
          slug: value.slug.trim(),
        });
        if (error) {
          setSubmitError(error.message ?? "Failed to create");
          return;
        }

        await router.invalidate();
        form.reset();
        onOpenChange?.(false);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Failed to create");
      }
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
      setSubmitError(null);
    }
  }, [form, open]);

  return (
    <Dialog
      modal
      onOpenChange={(v) => {
        if (!isFirst && onOpenChange) {
          onOpenChange(typeof v === "boolean" ? v : (v as { open: boolean }).open);
        }
      }}
      open={open}
    >
      <DialogContent className="max-w-md" showCloseButton={!isFirst}>
        <DialogHeader>
          <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <IconLayoutGrid className="size-6 text-primary" />
          </div>
          <DialogTitle>
            {isFirst ? "Create your first workspace" : "Create new workspace"}
          </DialogTitle>
          <DialogDescription>
            {isFirst
              ? "Workspaces help you organize projects and teams. Create one to get started."
              : "Add a new workspace to organize different projects and teams."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4 py-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          {submitError ? <p className="text-destructive text-sm">{submitError}</p> : null}
          <FormGroup>
            <form.Field
              name="name"
              validators={{
                onBlur: ({ value }) => (value.trim() ? undefined : "Please enter workspace name"),
                onChange: ({ value }) => {
                  const normalizedSlug = value
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "");
                  const currentSlug = form.getFieldValue("slug");
                  const previousNameSlug = form
                    .getFieldValue("name")
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "");

                  if (!currentSlug || currentSlug === previousNameSlug) {
                    form.setFieldValue("slug", normalizedSlug);
                  }
                  return value.trim() ? undefined : "Please enter workspace name";
                },
              }}
            >
              {(field) => {
                return (
                  <FormTextField
                    field={field}
                    id="workspace-name"
                    inputProps={{ placeholder: "e.g. My Team" }}
                    label="Workspace name"
                    onValueChange={() => {
                      if (submitError) {
                        setSubmitError(null);
                      }
                    }}
                  />
                );
              }}
            </form.Field>
            <form.Field
              name="slug"
              validators={{
                onBlur: ({ value }) => {
                  const trimmed = value.trim();
                  if (!trimmed) {
                    return "Please enter workspace slug";
                  }
                  if (!/^[a-z0-9-]+$/.test(trimmed)) {
                    return "Use lowercase letters, numbers, and hyphens only";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <FormItem data-invalid={isInvalid}>
                    <FormLabel htmlFor="workspace-slug">Workspace slug</FormLabel>
                    <FormControl>
                      <Input
                        aria-invalid={isInvalid}
                        id="workspace-slug"
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          if (submitError) {
                            setSubmitError(null);
                          }
                          field.handleChange(event.target.value);
                        }}
                        placeholder="e.g. my-team"
                        value={field.state.value}
                      />
                      <FormDescription>
                        For URLs, lowercase letters, numbers and hyphens only
                      </FormDescription>
                      {isInvalid ? (
                        <FormMessage
                          errors={field.state.meta.errors.map((message) =>
                            typeof message === "string" ? { message } : undefined,
                          )}
                        />
                      ) : null}
                    </FormControl>
                  </FormItem>
                );
              }}
            </form.Field>
          </FormGroup>
        </form>
        <DialogFooter>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <Button
                disabled={!canSubmit || isSubmitting}
                onClick={() => void form.handleSubmit()}
              >
                {isSubmitting ? "Creating..." : "Create workspace"}
              </Button>
            )}
          </form.Subscribe>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

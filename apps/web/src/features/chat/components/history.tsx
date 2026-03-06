import { DotsThreeIcon } from "@phosphor-icons/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@raypx/design-system/components/ui/alert-dialog";
import { Button } from "@raypx/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/design-system/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@raypx/design-system/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@raypx/design-system/components/ui/dropdown-menu";
import { Input } from "@raypx/design-system/components/ui/input";
import { Skeleton } from "@raypx/design-system/components/ui/skeleton";
import { useMemo, useState } from "react";

type ConversationListItem = {
  id: string;
  title: string;
  updatedAt: string | Date;
};

type HistoryPanelProps = {
  conversations: ConversationListItem[];
  activeConversationId: string | null;
  isLoading: boolean;
  busyConversationId: string | null;
  onStartNewConversation: () => void;
  onSelectConversation: (conversationId: string) => void;
  onRenameConversation: (conversationId: string, title: string) => void;
  onDeleteConversation: (conversationId: string) => void;
};

export function HistoryPanel({
  conversations,
  activeConversationId,
  isLoading,
  busyConversationId,
  onStartNewConversation,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
}: HistoryPanelProps) {
  const [renamingConversationId, setRenamingConversationId] = useState<string | null>(null);
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const renamingConversation = useMemo(
    () => conversations.find((item) => item.id === renamingConversationId) ?? null,
    [conversations, renamingConversationId],
  );
  const deletingConversation = useMemo(
    () => conversations.find((item) => item.id === deletingConversationId) ?? null,
    [conversations, deletingConversationId],
  );

  return (
    <>
      <Card className="h-full min-h-0">
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Recent conversations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button className="w-full" onClick={onStartNewConversation} variant="outline">
            New conversation
          </Button>
          <div className="max-h-[560px] space-y-2 overflow-y-auto md:max-h-[calc(100vh-240px)]">
            {isLoading && conversations.length === 0
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div
                    className="space-y-2 rounded-md border p-3"
                    key={`history-skeleton-${index}`}
                  >
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-3 w-2/5" />
                  </div>
                ))
              : null}
            {conversations.map((item) => {
              const isBusy = busyConversationId === item.id;
              return (
                <div
                  className={`flex items-start gap-1 rounded-md border px-2 py-2 ${
                    item.id === activeConversationId
                      ? "border-primary bg-primary/10"
                      : "bg-background"
                  }`}
                  key={item.id}
                >
                  <button
                    className="min-w-0 flex-1 px-1 text-left text-sm"
                    onClick={() => {
                      if (item.id === activeConversationId) return;
                      onSelectConversation(item.id);
                    }}
                    type="button"
                  >
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(item.updatedAt).toLocaleString()}
                    </p>
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      disabled={isBusy}
                      render={
                        <Button
                          aria-label="Conversation actions"
                          className="h-7 w-7 p-0"
                          disabled={isBusy}
                          size="icon"
                          variant="ghost"
                        >
                          <DotsThreeIcon className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem
                        disabled={isBusy}
                        onClick={() => {
                          setRenamingConversationId(item.id);
                          setRenameTitle(item.title);
                        }}
                      >
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={isBusy}
                        onClick={() => {
                          setDeletingConversationId(item.id);
                        }}
                        variant="destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
            {!isLoading && conversations.length === 0 ? (
              <p className="px-1 py-4 text-muted-foreground text-sm">No history yet.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Dialog
        onOpenChange={(open) => {
          if (open) return;
          setRenamingConversationId(null);
          setRenameTitle("");
        }}
        open={Boolean(renamingConversationId)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename conversation</DialogTitle>
            <DialogDescription>Update the title shown in your history.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!renamingConversation) return;
              const title = renameTitle.trim();
              if (!title || title === renamingConversation.title) {
                setRenamingConversationId(null);
                setRenameTitle("");
                return;
              }
              onRenameConversation(renamingConversation.id, title);
              setRenamingConversationId(null);
              setRenameTitle("");
            }}
          >
            <Input
              autoFocus
              maxLength={160}
              onChange={(event) => {
                setRenameTitle(event.target.value);
              }}
              placeholder="Conversation title"
              value={renameTitle}
            />
            <DialogFooter>
              <Button
                onClick={() => {
                  setRenamingConversationId(null);
                  setRenameTitle("");
                }}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={!renameTitle.trim()} type="submit">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        onOpenChange={(open) => {
          if (open) return;
          setDeletingConversationId(null);
        }}
        open={Boolean(deletingConversationId)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
              {deletingConversation ? ` "${deletingConversation.title}" will be removed.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deletingConversation) return;
                onDeleteConversation(deletingConversation.id);
                setDeletingConversationId(null);
              }}
              render={<Button variant="destructive" />}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

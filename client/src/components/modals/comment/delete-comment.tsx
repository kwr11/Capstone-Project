"use client";

import { deleteComment } from "@/actions/comment";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../../ui/button";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { doServerAction } from "@/lib/utils.client";

interface DeleteCommentDialogProps extends React.PropsWithChildren {
  commentId: IComment["id"];
}

export function DeleteCommentDialog({
  commentId,
  children,
}: DeleteCommentDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const router = useRouter();

  async function doDeleteComment() {
    setIsProcessing(true);

    const [, error] = await doServerAction(deleteComment(commentId));

    setIsProcessing(false);

    if (error) {
      setError(error.message);
      return;
    } else {
      setIsDialogOpen(false);
    }

    router.refresh();
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            If you delete this comment, it will be gone permanently.
          </DialogDescription>
        </DialogHeader>
        <div>
          <p>Are you sure you want to this comment?</p>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant={"destructive"}
            onClick={doDeleteComment}
            disabled={isProcessing}
          >
            {isProcessing ? "Deleting..." : `Delete comment`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

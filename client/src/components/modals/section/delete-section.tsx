"use client";

import { deleteSection } from "@/actions/section";
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

interface DeleteSectionDialogProps extends React.PropsWithChildren {
  section: ISection;
}

export function DeleteSectionDialog({
  section,
  children,
}: DeleteSectionDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const router = useRouter();

  async function doDeleteSection() {
    setIsProcessing(true);

    const [, error] = await doServerAction(
      deleteSection(section.course_id, section.id)
    );

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
            If you delete this section, it will be gone permanently.
          </DialogDescription>
        </DialogHeader>
        <div>
          <p>
            Are you sure you want to delete <strong>{section.name}</strong>?
          </p>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant={"destructive"}
            onClick={doDeleteSection}
            disabled={isProcessing}
          >
            {isProcessing ? "Deleting..." : `Delete ${section.name}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { FormField } from "@/components/form-field";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { Button } from "../../ui/button";

import { createTeam } from "@/actions/team";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AddTeamDialogProps extends React.PropsWithChildren {
  courseId: ICourse["id"];
}

export function AddTeamDialog({ children, courseId }: AddTeamDialogProps) {
  const [formState, formAction, isFormPending] = useActionState(
    createTeam,
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (formState?.success) {
      setIsDialogOpen(false);
      router.refresh();
    }
  }, [formState, router]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new team</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-4">
            <FormField name="name" errors={formState?.fieldErrors?.name}>
              <FormField.Label>Team name</FormField.Label>
              <FormField.Input
                type="text"
                placeholder="A1"
                defaultValue={formState?.fields?.name}
              />
            </FormField>
            <input type="hidden" name="courseId" value={courseId} />
            {formState?.error && (
              <p className="text-destructive">{formState.error.message}</p>
            )}
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isFormPending}>
              {!isFormPending ? "Create" : "Creating..."}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { FormField } from "@/components/form-field";
import { useRouter } from "next/navigation";
import React, { useActionState, useEffect, useState } from "react";
import { Button } from "../../ui/button";

import { updateSection } from "@/actions/section";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EditSectionDialogProps extends React.PropsWithChildren {
  section: ISection;
}

export function EditSectionDialog({
  section,
  children,
}: EditSectionDialogProps) {
  const [formState, formAction, isFormPending] = useActionState(
    updateSection,
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
          <DialogTitle>Edit {section.name}</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-4">
            <FormField name="name" errors={formState?.fieldErrors?.name}>
              <FormField.Label>Section name</FormField.Label>
              <FormField.Input
                type="text"
                placeholder="9:30AM"
                defaultValue={formState?.fields?.name || section.name}
              />
            </FormField>
            <input type="hidden" name="courseId" value={section.course_id} />
            <input type="hidden" name="sectionId" value={section.id} />
            {formState?.error && (
              <p className="text-destructive">{formState.error.message}</p>
            )}
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isFormPending}>
              {!isFormPending ? "Save" : "Saving..."}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

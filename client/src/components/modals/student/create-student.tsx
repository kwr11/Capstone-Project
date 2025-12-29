"use client";

import { FormField } from "@/components/form-field";
import { useRouter } from "next/navigation";
import React, { useActionState, useEffect, useState } from "react";
import { Button } from "../../ui/button";

import { createStudent } from "@/actions/student";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AddSectionDialogProps extends React.PropsWithChildren {
  courseId: ICourse["id"];
  sectionId: ISection["id"];
}

export function AddStudentDialog({
  courseId,
  sectionId,
  children,
}: AddSectionDialogProps) {
  const [formState, formAction, isFormPending] = useActionState(
    createStudent,
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
          <DialogTitle>Add new student</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-4">
            <FormField name="name" errors={formState?.fieldErrors?.name}>
              <FormField.Label>Student name</FormField.Label>
              <FormField.Input
                type="text"
                defaultValue={formState?.fields?.name}
              />
            </FormField>
            <FormField name="email" errors={formState?.fieldErrors?.email}>
              <FormField.Label>Student email</FormField.Label>
              <FormField.Input
                type="email"
                defaultValue={formState?.fields?.email}
              />
            </FormField>
            <FormField name="major" errors={formState?.fieldErrors?.major}>
              <FormField.Label>Student major</FormField.Label>
              <FormField.Input
                type="text"
                defaultValue={formState?.fields?.major}
              />
            </FormField>
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="sectionId" value={sectionId} />
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

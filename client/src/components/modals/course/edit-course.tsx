"use client";

import { updateCourse } from "@/actions/course";
import { FormField } from "@/components/form-field";
import { useRouter } from "next/navigation";
import React, { useActionState, useEffect, useState } from "react";
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

interface EditCourseDialogProps extends React.PropsWithChildren {
  course: ICourse;
}

export function EditCourseDialog({ course, children }: EditCourseDialogProps) {
  const [formState, formAction, isFormPending] = useActionState(
    updateCourse,
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
          <DialogTitle>Edit {course.name}</DialogTitle>
          <DialogDescription>
            Edit the information for {course.name}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-4">
            <FormField name="name" errors={formState?.fieldErrors?.name}>
              <FormField.Label>Course name</FormField.Label>
              <FormField.Input
                type="text"
                placeholder="Software Engineering 1"
                defaultValue={formState?.fields?.name || course.name}
              />
            </FormField>
            <FormField name="code" errors={formState?.fieldErrors?.code}>
              <FormField.Label>Course code</FormField.Label>
              <FormField.Input
                type="text"
                placeholder="CEN3031"
                defaultValue={formState?.fields?.code || course.code}
              />
            </FormField>
            <FormField name="term" errors={formState?.fieldErrors?.term}>
              <FormField.Label>Term</FormField.Label>
              <FormField.Input
                type="text"
                placeholder="Fall 2025"
                defaultValue={formState?.fields?.term || course.term}
              />
            </FormField>
            <input type="hidden" name="courseId" value={course.id} />
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

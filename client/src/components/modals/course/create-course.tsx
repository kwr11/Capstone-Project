"use client";

import { createCourse } from "@/actions/course";
import { FormField } from "@/components/form-field";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
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

export function AddCourseDialog({ children }: React.PropsWithChildren) {
  const [formState, formAction, isFormPending] = useActionState(
    createCourse,
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
          <DialogTitle>Add new course</DialogTitle>
          <DialogDescription>
            Creating a course will allow you to track students
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-4">
            <FormField name="name" errors={formState?.fieldErrors?.name}>
              <FormField.Label>Course name</FormField.Label>
              <FormField.Input
                type="text"
                placeholder="Software Engineering 1"
                defaultValue={formState?.fields?.name}
              />
            </FormField>
            <FormField name="code" errors={formState?.fieldErrors?.code}>
              <FormField.Label>Course code</FormField.Label>
              <FormField.Input
                type="text"
                placeholder="CEN3031"
                defaultValue={formState?.fields?.code}
              />
            </FormField>
            <FormField name="term" errors={formState?.fieldErrors?.term}>
              <FormField.Label>Term</FormField.Label>
              <FormField.Input
                type="text"
                placeholder="Fall 2025"
                defaultValue={formState?.fields?.term}
              />
            </FormField>
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

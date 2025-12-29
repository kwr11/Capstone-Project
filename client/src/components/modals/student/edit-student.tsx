"use client";

import { FormField } from "@/components/form-field";
import { useRouter } from "next/navigation";
import React, { useActionState, useEffect, useState } from "react";
import { Button } from "../../ui/button";

import { updateStudent } from "@/actions/student";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EditStudentDialogProps extends React.PropsWithChildren {
  student: IStudent;
}

export function EditStudentDialog({
  student,
  children,
}: EditStudentDialogProps) {
  const [formState, formAction, isFormPending] = useActionState(
    updateStudent,
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
      <DialogContent className="max-h-[90svh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Edit {student.name}</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-4">
            <FormField name="name" errors={formState?.fieldErrors?.name}>
              <FormField.Label>Name</FormField.Label>
              <FormField.Input
                type="text"
                defaultValue={formState?.fields?.name || student.name}
              />
            </FormField>
            <FormField name="email" errors={formState?.fieldErrors?.email}>
              <FormField.Label>Email</FormField.Label>
              <FormField.Input
                type="email"
                defaultValue={formState?.fields?.email || student.email}
              />
            </FormField>
            <FormField name="major" errors={formState?.fieldErrors?.major}>
              <FormField.Label>Major</FormField.Label>
              <FormField.Input
                type="text"
                defaultValue={formState?.fields?.major || student.major}
              />
            </FormField>
            <FormField
              name="leadership"
              errors={formState?.fieldErrors?.leadership}
            >
              <FormField.Label>Leadership</FormField.Label>
              <FormField.Input
                type="number"
                defaultValue={
                  formState?.fields?.leadership || String(student.leadership)
                }
                min="1"
                max="10"
              />
              <FormField.Description>
                Value between 1 and 10, inclusive
              </FormField.Description>
            </FormField>
            <FormField
              name="expertise"
              errors={formState?.fieldErrors?.expertise}
            >
              <FormField.Label>Expertise</FormField.Label>
              <FormField.Input
                type="number"
                defaultValue={
                  formState?.fields?.expertise || String(student.expertise)
                }
                min="1"
                max="10"
              />
              <FormField.Description>
                Value between 1 and 10, inclusive
              </FormField.Description>
            </FormField>
            <FormField
              name="languages"
              errors={formState?.fieldErrors?.languages}
            >
              <FormField.Label>Languages</FormField.Label>
              <FormField.Input
                type="text"
                defaultValue={
                  formState?.fields?.languages ||
                  student.languages?.map((l) => l.name).join(", ")
                }
              />
              <FormField.Description>
                Comma-separated list of languages
              </FormField.Description>
            </FormField>
            <FormField
              name="frameworks"
              errors={formState?.fieldErrors?.frameworks}
            >
              <FormField.Label>Frameworks</FormField.Label>
              <FormField.Input
                type="text"
                defaultValue={
                  formState?.fields?.frameworks ||
                  student.frameworks?.map((f) => f.name).join(", ")
                }
              />
              <FormField.Description>
                Comma-separated list of frameworks
              </FormField.Description>
            </FormField>
            <FormField
              name="work_with"
              errors={formState?.fieldErrors?.work_with}
            >
              <FormField.Label>Work with</FormField.Label>
              <FormField.Input
                type="text"
                defaultValue={
                  formState?.fields?.work_with || student.work_with?.join(", ")
                }
              />
              <FormField.Description>
                Comma-separated list of student names
              </FormField.Description>
            </FormField>
            <FormField
              name="dont_work_with"
              errors={formState?.fieldErrors?.dont_work_with}
            >
              <FormField.Label>{"Don't work with"}</FormField.Label>
              <FormField.Input
                type="text"
                defaultValue={
                  formState?.fields?.dont_work_with ||
                  student.dont_work_with?.join(", ")
                }
              />
              <FormField.Description>
                Comma-separated list of student names
              </FormField.Description>
            </FormField>
            <input type="hidden" name="courseId" value={student.course_id} />
            <input type="hidden" name="sectionId" value={student.section_id} />
            <input type="hidden" name="studentId" value={student.id} />
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

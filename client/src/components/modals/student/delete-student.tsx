"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../../ui/button";

import { deleteStudent } from "@/actions/student";
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

interface DeleteStudentDialogProps extends React.PropsWithChildren {
  student: Pick<IStudent, "name" | "id" | "course_id" | "section_id">;
}

export function DeleteStudentDialog({
  student,
  children,
}: DeleteStudentDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const router = useRouter();

  async function doDeleteStudent() {
    setIsProcessing(true);

    const [, error] = await doServerAction(
      deleteStudent(student.course_id, student.section_id, student.id)
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
            If you delete this student, it will be gone permanently.
          </DialogDescription>
        </DialogHeader>
        <div>
          <p>
            Are you sure you want to delete <strong>{student.name}</strong>?
          </p>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant={"destructive"}
            onClick={doDeleteStudent}
            disabled={isProcessing}
          >
            {isProcessing ? "Deleting..." : `Delete ${student.name}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

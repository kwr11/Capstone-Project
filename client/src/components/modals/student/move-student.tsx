"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../../ui/button";

import { moveStudent } from "@/actions/student";
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

export function MoveStudentDialog({
  student,
  children,
}: DeleteStudentDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const router = useRouter();

  async function doMoveStudent() {
    const [, error] = await doServerAction(
      moveStudent(student.course_id, student.section_id, student.id, null)
    );

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
            You are about to remove {student.name} from the team.
          </DialogDescription>
        </DialogHeader>
        <div>
          <p>
            Are you sure you want to remove <strong>{student.name}</strong> from
            the team?
          </p>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant={"destructive"} onClick={doMoveStudent}>
            Move {student.name}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { StudentData, StudentLinks } from "../student-data";
import { Button } from "../ui/button";

export function StudentViewDialog({
  course,
  section,
  student,
  team,
}: {
  course: ICourse;
  section: ISection;
  student: IStudent;
  team?: ITeam;
}) {
  const router = useRouter();

  return (
    <Dialog open={true} onOpenChange={() => router.back()}>
      <DialogDescription className="hidden">
        Popup containing individual student information
      </DialogDescription>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{student.name}</DialogTitle>
          <DialogDescription>
            <Link className="falafel-link" href={`mailto:${student.email}`}>
              {student.email}
            </Link>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 pb-4 border-b border-border">
          <h2 className="font-medium">Student Links</h2>
          <StudentLinks
            course={course}
            section={section}
            team={team}
            student={student}
          />
        </div>
        <div className="grid gap-2">
          <h2 className="font-medium">Student Data</h2>
          <StudentData student={student} />
        </div>
        <DialogFooter className="mt-4">
          <Button
            onClick={() => {
              // Hard-redirect to avoid the intercepted route
              window.location.assign(window.location.href);
            }}
          >
            View page
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

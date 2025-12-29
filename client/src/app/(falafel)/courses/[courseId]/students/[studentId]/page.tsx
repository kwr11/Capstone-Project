"use server";

import { notFound } from "next/navigation";

import { getCourse } from "@/actions/course";
import { assignLabels, getAllLabels } from "@/actions/label";
import FALAFELBreadcrumbs from "@/components/breadcrumb";
import { CommentFeed } from "@/components/comments/comment";
import { AddCommentForm } from "@/components/comments/comment-form";
import { ErrorPage } from "@/components/error-page";
import LabelCell from "@/components/label/label-cell";
import { LabelProvider } from "@/components/label/label-provider";
import { EditStudentDialog } from "@/components/modals/student/edit-student";
import { StudentData, StudentLinks } from "@/components/student-data";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";

export default async function Student({
  params,
}: {
  params: Promise<{
    courseId: string;
    studentId: string;
  }>;
}) {
  const { courseId, studentId } = await params;

  const [course, getCourseError] = await getCourse(Number(courseId));

  if (getCourseError) {
    return <ErrorPage text="Unable to fetch student" />;
  }

  const section = course?.sections.find((section) =>
    section.students.some((student) => student.id === Number(studentId))
  );

  const student = section?.students.find(
    (student) => student.id === Number(studentId)
  );

  if (!course || !section || !student) notFound();

  const team = course?.teams.find((team) =>
    team.students.some((s) => s.id === student.id)
  );

  const [labels] = await getAllLabels();

  const breadcrumbs: ILinkComponent[] = [
    {
      label: course.name,
      url: `/courses/${course.id}`,
    },
    {
      label: section.name,
      url: `/courses/${course.id}/sections/${section.id}`,
    },
    {
      label: student.name,
      url: `/courses/${course.id}/students/${student.id}`,
    },
  ];

  return (
    <div className="grid xl:grid-cols-[1fr_350px] gap-4 relative">
      <LabelProvider labels={labels || []} assigner={assignLabels}>
        <div className="max-w-full">
          <FALAFELBreadcrumbs pathList={breadcrumbs} />
          <div className="flex flex-wrap gap-x-3 items-center mb-4">
            <h1 className="my-4 text-[3rem] font-extrabold">{student.name}</h1>
            <EditStudentDialog student={student}>
              <Button variant="outline">
                <PencilIcon />
                Edit
              </Button>
            </EditStudentDialog>
          </div>
          <LabelCell type="student" labels={student.labels} id={student.id} />
          <hr className="my-6" />
          <StudentLinks
            course={course}
            section={section}
            team={team}
            student={student}
          />
          <h2 className="text-2xl font-semibold mt-6 mb-3">Student Data</h2>
          <StudentData student={student} />
        </div>
        <div className="flex flex-col h-[calc(100svh-var(--spacing)*30)] gap-2 overflow-auto pr-2">
          <h2 className="text-lg font-semibold">Comments</h2>
          <CommentFeed comments={student.comments} />
          <AddCommentForm
            className="sticky pt-4 bottom-0 inset-x-0 bg-gradient-to-b from-transparent to-background from-0% to-[calc(var(--spacing)*4)]"
            studentId={student.id}
          />
        </div>
      </LabelProvider>
    </div>
  );
}

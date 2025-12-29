import { getCourse } from "@/actions/course";
import { assignLabels, getAllLabels } from "@/actions/label";
import { ErrorPage } from "@/components/error-page";
import { LabelProvider } from "@/components/label/label-provider";
import { StudentViewDialog } from "@/components/modals/student-view";
import { notFound } from "next/navigation";

export default async function Student({
  params,
}: {
  params: Promise<{
    courseId: string;
    sectionId: string;
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

  return (
    <LabelProvider labels={labels || []} assigner={assignLabels}>
      <StudentViewDialog
        course={course}
        section={section}
        student={student}
        team={team}
      />
    </LabelProvider>
  );
}

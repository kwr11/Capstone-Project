import { getCourse } from "@/actions/course";
import { ErrorPage } from "@/components/error-page";
import { TeamBuilder } from "@/components/team-builder";
import { TeamBuilderProvider } from "@/components/team-builder-provider";
import { notFound } from "next/navigation";

export default async function BuildTeamPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const [course, getCourseError] = await getCourse(Number(courseId));

  if (getCourseError) {
    return <ErrorPage text="Unable to fetch team" />;
  }

  if (!course) {
    notFound();
  }

  return (
    <TeamBuilderProvider value={course}>
      <TeamBuilder />
    </TeamBuilderProvider>
  );
}

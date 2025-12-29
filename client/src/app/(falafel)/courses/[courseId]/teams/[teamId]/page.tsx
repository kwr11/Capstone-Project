import { getCourse } from "@/actions/course";
import { assignLabels, getAllLabels } from "@/actions/label";
import FALAFELBreadcrumbs from "@/components/breadcrumb";
import { CommentFeed } from "@/components/comments/comment";
import { AddCommentForm } from "@/components/comments/comment-form";
import { ErrorPage } from "@/components/error-page";
import { FALAFELTable } from "@/components/falafel-table";
import LabelCell from "@/components/label/label-cell";
import { LabelProvider } from "@/components/label/label-provider";
import { EditTeamDialog } from "@/components/modals/team/edit-team";
import { TeamProvider } from "@/components/team";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { studentCols } from "./columns";

export default async function TeamPage({
  params,
}: {
  params: Promise<{
    courseId: string;
    teamId: string;
  }>;
}) {
  const { courseId, teamId } = await params;
  const [course, getCourseError] = await getCourse(Number(courseId));

  if (getCourseError) {
    return <ErrorPage text="Unable to fetch team" />;
  }

  if (!course) notFound();

  const team = course.teams?.find((team) => team.id === Number(teamId));
  if (!team) notFound();

  const [labels] = await getAllLabels();

  const breadcrumbs: ILinkComponent[] = [
    {
      label: "Home",
      url: "/",
    },
    {
      label: course.name || "Course",
      url: `/courses/${course.id}`,
    },
    {
      label: team.name || "Team",
      url: `/courses/${course.id}/teams/${teamId}`,
    },
  ];

  return (
    <TeamProvider course={course} team={team}>
      <LabelProvider labels={labels || []} assigner={assignLabels}>
        <div className="grid xl:grid-cols-[1fr_350px] gap-4">
          <div className="max-w-full overflow-hidden">
            <FALAFELBreadcrumbs pathList={breadcrumbs} />
            <div className="flex flex-wrap gap-x-3 items-center mb-4">
              <h1 className="my-4 text-[3rem] font-extrabold">{team.name}</h1>
              <EditTeamDialog team={team}>
                <Button variant="outline">
                  <PencilIcon />
                  Edit
                </Button>
              </EditTeamDialog>
            </div>
            <LabelCell type="team" labels={team.labels} id={team.id} />
            <hr className="my-6 border-border" />
            <h2 className="text-[1.8rem] font-semibold">Students</h2>
            <FALAFELTable
              className="max-w-full"
              columns={studentCols}
              data={[...team.students]}
            >
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link
                    href={`/courses/${course.id}/teams/build?team=${team.id}`}
                  >
                    Team Builder
                  </Link>
                </Button>
              </div>
            </FALAFELTable>
          </div>
          <div className="flex flex-col h-[calc(100svh-var(--spacing)*30)] gap-2 overflow-auto pr-2">
            <h2 className="text-lg font-semibold">Comments</h2>
            <CommentFeed comments={team.comments} />
            <AddCommentForm
              className="sticky pt-4 bottom-0 inset-x-0 bg-gradient-to-b from-transparent to-background from-0% to-[calc(var(--spacing)*4)]"
              teamId={team.id}
            />
          </div>
        </div>
      </LabelProvider>
    </TeamProvider>
  );
}

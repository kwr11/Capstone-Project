import { getCourse } from "@/actions/course";
import { assignLabels, getAllLabels } from "@/actions/label";
import FALAFELBreadcrumbs from "@/components/breadcrumb";
import { ErrorPage } from "@/components/error-page";
import { FALAFELTable } from "@/components/falafel-table";
import { LabelProvider } from "@/components/label/label-provider";
import { AddSectionDialog } from "@/components/modals/section/create-section";
import { AddTeamDialog } from "@/components/modals/team/create-team";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sectionCols, teamCols } from "./columns";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const [course, getCourseError] = await getCourse(Number(courseId));

  if (getCourseError) {
    return <ErrorPage text="Unable to fetch course" />;
  }

  if (!course) notFound();

  const [labels] = await getAllLabels();

  const breadcrumbs: ILinkComponent[] = [
    {
      label: "Home",
      url: "/",
    },
    {
      label: course.name,
      url: `/courses/${courseId}`,
    },
  ];

  return (
    <div>
      <FALAFELBreadcrumbs pathList={breadcrumbs} />
      <h1 className="my-4 text-[3rem] font-extrabold">{course.name}</h1>
      <p className="falafel-text opacity-60 text-sm mr-2">{course.code}</p>
      <div className="mt-10">
        <h2 className="text-[1.8rem] font-semibold">Sections</h2>
        <FALAFELTable
          columns={sectionCols}
          data={course.sections}
          disableFilter
        >
          <AddSectionDialog courseId={course.id}>
            <Button>
              <PlusIcon />
              Add Section
            </Button>
          </AddSectionDialog>
        </FALAFELTable>
      </div>
      <div className="mt-10">
        <h2 className="text-[1.8rem] font-semibold">Teams</h2>
        <LabelProvider labels={labels || []} assigner={assignLabels}>
          <FALAFELTable columns={teamCols} data={course.teams || []}>
            <div className="flex gap-2 items-center">
              <Button variant="ghost" asChild>
                <Link href={`/courses/${course.id}/teams/build`}>
                  Team Builder
                </Link>
              </Button>
              <AddTeamDialog courseId={course.id}>
                <Button
                  variant="ghost"
                  className="cursor-pointer falafel-link no-underline!"
                >
                  <PlusIcon />
                  Add Team
                </Button>
              </AddTeamDialog>
            </div>
          </FALAFELTable>
        </LabelProvider>
      </div>
    </div>
  );
}

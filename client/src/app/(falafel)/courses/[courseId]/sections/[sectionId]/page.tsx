import { assignLabels, getAllLabels } from "@/actions/label";
import { getSection } from "@/actions/section";
import FALAFELBreadcrumbs from "@/components/breadcrumb";
import { ErrorPage } from "@/components/error-page";
import { FALAFELTable } from "@/components/falafel-table";
import { LabelProvider } from "@/components/label/label-provider";
import { AddStudentDialog } from "@/components/modals/student/create-student";
import { UpdateStudentsDialog } from "@/components/modals/student/update-students";
import { UploadStudentsDialog } from "@/components/modals/student/upload-students";
import { Button } from "@/components/ui/button";
import _ from "lodash";
import { PlusIcon, UploadIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { studentCols } from "./columns";

export default async function SectionPage({
  params,
}: {
  params: Promise<{
    courseId: string;
    sectionId: string;
  }>;
}) {
  const { courseId, sectionId } = await params;

  const [section, getSectionError] = await getSection(
    Number(courseId),
    Number(sectionId)
  );

  if (getSectionError) {
    return <ErrorPage text="Unable to fetch section" />;
  }

  if (!section) notFound();

  const [labels] = await getAllLabels();

  const breadcrumbs: ILinkComponent[] = [
    {
      label: "Home",
      url: "/",
    },
    {
      label: section.course_name || "Course",
      url: `/courses/${section.course_id}`,
    },
    {
      label: section.name || "Section",
      url: `/courses/${section.course_id}/sections/${sectionId}`,
    },
  ];

  return (
    <div>
      <FALAFELBreadcrumbs pathList={breadcrumbs} />
      <h1 className="my-4 text-[3rem] font-extrabold">{section.name}</h1>
      <p className="falafel-text opacity-60 text-sm mr-2">
        In {section.course_name}
      </p>
      <div className="mt-10">
        <h2 className="text-[1.8rem] font-semibold">Students</h2>
        <LabelProvider labels={labels || []} assigner={assignLabels}>
          <FALAFELTable
            enableColumnHiding
            columns={studentCols}
            data={_.sortBy(section.students, [
              (s) => {
                return s.name.split(" ").reverse().join(", ");
              },
            ])}
          >
            <div className="flex gap-2 items-center">
              <UpdateStudentsDialog
                courseId={section.course_id}
                sectionId={section.id}
              >
                <Button variant="ghost">
                  <UploadIcon />
                  Upload survey data
                </Button>
              </UpdateStudentsDialog>
              <AddStudentDialog
                courseId={section.course_id}
                sectionId={section.id}
              >
                <Button variant="outline">
                  <PlusIcon />
                  Add Student
                </Button>
              </AddStudentDialog>
              <UploadStudentsDialog
                courseId={section.course_id}
                sectionId={section.id}
              >
                <Button>
                  <UploadIcon />
                  Upload Students
                </Button>
              </UploadStudentsDialog>
            </div>
          </FALAFELTable>
        </LabelProvider>
      </div>
    </div>
  );
}

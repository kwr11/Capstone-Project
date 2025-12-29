import { getAllCourses } from "@/actions/course";
import FALAFELBreadcrumbs from "@/components/breadcrumb";
import { FALAFELTable } from "@/components/falafel-table";
import { AddCourseDialog } from "@/components/modals/course/create-course";
import { RecentActivity } from "@/components/recent-activity";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { courseCols } from "./columns";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const breadcrumbs = [
    {
      label: "Home",
      url: "/",
    },
  ];

  const [courses, getCourseError] = await getAllCourses();

  return (
    <div>
      <FALAFELBreadcrumbs pathList={breadcrumbs} />
      <h1 className="my-4 text-[3rem] font-extrabold">Welcome Back</h1>
      <div className="flex items-center">
        <p className="falafel-text opacity-60 text-sm mr-2">Recent activity:</p>
        <RecentActivity />
      </div>
      <div className="mt-10">
        <h2 className="text-[1.8rem] font-semibold">Your Courses</h2>
        {!getCourseError ? (
          <FALAFELTable columns={courseCols} data={courses}>
            <AddCourseDialog>
              <Button>
                <PlusIcon />
                Add course
              </Button>
            </AddCourseDialog>
          </FALAFELTable>
        ) : (
          <p className="mt-2 text-muted-foreground">Unable to fetch courses</p>
        )}
      </div>
    </div>
  );
}

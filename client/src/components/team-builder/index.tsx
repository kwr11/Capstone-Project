"use client";

import { moveStudent } from "@/actions/student";
import { doServerAction } from "@/lib/utils.client";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { createContext, DragEvent, useContext, useState } from "react";
import FALAFELBreadcrumbs from "../breadcrumb";
import { TeamBuilderContext } from "../team-builder-provider";
import { StudentsList } from "./students-list";
import { TeamsList } from "./teams";

export const TeamBuilderProcessingContext = createContext<
  | {
      isProcessing: boolean;
      setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
    }
  | undefined
>(undefined);

export type StudentDragData = IStudent;

export function doMoveStudent(
  courseId: number,
  teamId: number | null,
  router: AppRouterInstance,
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>
) {
  return async (e: DragEvent<HTMLDivElement>) => {
    let student: StudentDragData;
    try {
      const data = e.dataTransfer.getData("application/json");
      if (!data) return;
      student = JSON.parse(data);
    } catch (e) {
      console.error(e);
      alert("Failed to move student.");
      return;
    }

    if (student.team_id === teamId) return;

    setIsProcessing(true);

    const [, moveStudentError] = await doServerAction(
      moveStudent(courseId, student.section_id, student.id, teamId)
    );

    setIsProcessing(false);

    if (moveStudentError) {
      alert(`Unable to move ${student.name}`);
      return;
    }

    router.refresh();
  };
}

export function TeamBuilder() {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const course = useContext(TeamBuilderContext)!;

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
      label: "Team Builder",
      url: `/courses/${course.id}/teams/build`,
    },
  ];

  return (
    <TeamBuilderProcessingContext.Provider
      value={{ isProcessing, setIsProcessing }}
    >
      <div className="grid grid-cols-[300px_1fr] grid-rows-[min-content_1fr] gap-4 h-[calc(100svh-var(--spacing)*30)] select-none">
        {isProcessing && (
          <div className="fixed inset-0 z-[100] cursor-progress bg-background/15 backdrop-blur-xs grid place-items-center">
            <p>Processing...</p>
          </div>
        )}
        <div className="col-span-full">
          <FALAFELBreadcrumbs pathList={breadcrumbs} />
        </div>
        <StudentsList />
        <TeamsList />
      </div>
    </TeamBuilderProcessingContext.Provider>
  );
}

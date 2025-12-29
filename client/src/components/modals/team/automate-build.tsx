"use client";

import { useRouter } from "next/navigation";
import { doServerAction } from "@/lib/utils.client";
import { getAllSections } from "@/actions/section";

import { useEffect, useState } from "react";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ActionSelector, Stages } from "./automation/action-selector";
import { CreateTeamsForm } from "./automation/team-creation";
import { SeedTeams } from "./automation/team-seeding";
import { DeleteTeamsForm } from "./automation/team-deletion";
import { PopulateTeams } from "./automation/team-population";

interface AutomateTeamDialogProps extends React.PropsWithChildren {
  courseId: ICourse["id"];
  courseName: string;
  teams: ITeam[];
  students: IStudent[];
}

export function AutomateBuildDialog({
  children,
  courseId,
  courseName,
  teams,
  students,
}: AutomateTeamDialogProps) {
  const [sections, setSections] = useState<ISection[] | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [currentState, setCurrentState] = useState<Stages>(
    Stages.SELECT_ACTION
  );
  const router = useRouter();

  const handleOpenClose = (open: boolean) => {
    setIsDialogOpen(open);

    if (!open) {
      setCurrentState(Stages.SELECT_ACTION);
    }
  };

  useEffect(() => {
    (async () => {
      const [res, err] = await doServerAction(getAllSections(courseId));

      if (!err) {
        setSections(res);
      }
    })();
  }, [courseId]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        {currentState === Stages.SELECT_ACTION && (
          <ActionSelector setState={setCurrentState} />
        )}
        {currentState === Stages.CREATE_TEAMS && (
          <CreateTeamsForm
            courseId={courseId}
            router={router}
            setState={setCurrentState}
          />
        )}
        {currentState === Stages.SEED_TEAMS && (
          <SeedTeams
            courseId={courseId}
            sections={sections || []}
            teams={teams}
            students={students}
            router={router}
            setState={setCurrentState}
          />
        )}
        {currentState === Stages.DELETE_TEAMS && (
          <DeleteTeamsForm
            courseId={courseId}
            courseName={courseName}
            router={router}
            setState={setCurrentState}
          />
        )}
        {currentState === Stages.POPULATE_TEAMS && (
          <PopulateTeams
            courseId={courseId}
            sections={sections || []}
            teams={teams}
            students={students}
            router={router}
            setState={setCurrentState}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

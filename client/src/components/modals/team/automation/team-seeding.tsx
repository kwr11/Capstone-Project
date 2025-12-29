"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { batchMoveStudents, MoveStudentObj } from "@/actions/student";
import { doServerAction } from "@/lib/utils.client";

import { Dispatch, SetStateAction, useState } from "react";

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Stages } from "./action-selector";
import { EntitySelector } from "./entity-selector";
import { Button } from "@/components/ui/button";

export interface SeedTeamsProps {
  courseId: ICourse["id"];
  sections: ISection[];
  teams: ITeam[];
  students: IStudent[];
  router: AppRouterInstance;
  setState: Dispatch<SetStateAction<Stages>>;
}

export type MoveStudentArgs = {
  courseId: number;
  moves: MoveStudentObj[];
};

export function SeedTeams({
  courseId,
  sections,
  teams,
  students,
  router,
  setState,
}: SeedTeamsProps) {
  const [selectedSections, setSelectedSections] = useState<number[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();

  const handleSeed = async () => {
    setIsProcessing(true);

    const emptyTeamsCount = teams
      .filter((team) => team.students.length === 0)
      .filter((team) => selectedTeams.includes(team.id)).length;

    if (!emptyTeamsCount) {
      setError("At least one selected team must be empty");
      setIsProcessing(false);
      return;
    }

    const teamedStudents = new Set<number>();

    // Get all teamed student ids and add them to the set
    for (const stud of teams.map((team) => team.students).flat()) {
      teamedStudents.add(stud.id);
    }

    // Filters the teamed students out, and enforces the selected sections
    let availableStudents = students
      .filter((stud) => !teamedStudents.has(stud.id))
      .filter((stud) => selectedSections.includes(stud.section_id));

    // Ensures at least one student is available for each empty team
    if (availableStudents.length < emptyTeamsCount) {
      setError("Not enough students available to seed");
      setIsProcessing(false);
      return;
    }

    // Stores a list of arguments to send to the moveStudent function
    const moveStudentArgs: MoveStudentArgs = {
      courseId: courseId,
      moves: [],
    };

    for (const team of teams) {
      // Ignore teams with members, as well as teams not selected
      if (team.students.length !== 0 || !selectedTeams.includes(team.id)) {
        continue;
      }

      // Pick a random student from the available pool
      const randomStudentIdx = Math.floor(
        Math.random() * availableStudents.length
      );
      const sectionId = availableStudents[randomStudentIdx].section_id;

      if (!sectionId) throw new Error("An unexpected error occurred");

      // Append to the args to be sent to the batch processing function
      moveStudentArgs.moves.push({
        sectionId: sectionId,
        studentId: availableStudents[randomStudentIdx].id,
        teamId: team.id,
      });

      // Remove the selected student from the available pool
      availableStudents = availableStudents.filter(
        (_, i) => i != randomStudentIdx
      );
    }

    // Early exit if no students were chosen in spite of the earlier guards
    if (moveStudentArgs.moves.length === 0) {
      setError("An unexpected error occurred");
      setIsProcessing(false);
      return;
    }

    // Seed the teams using the generated args
    const [, error] = await doServerAction(
      batchMoveStudents(courseId, moveStudentArgs.moves)
    );

    if (error) {
      setError(error.message);
    } else {
      router.refresh();
      setState(Stages.SELECT_ACTION);
    }

    setIsProcessing(false);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Seed Teams</DialogTitle>
      </DialogHeader>
      <DialogDescription>
        All empty teams will have a random student from the available pool
        assigned to them.
      </DialogDescription>
      <EntitySelector
        name="Sections"
        entities={sections}
        selectedEntities={selectedSections}
        setSelectedEntities={setSelectedSections}
      >
        Select the sections to pull students from:
      </EntitySelector>
      <EntitySelector
        name="Teams"
        entities={teams}
        selectedEntities={selectedTeams}
        setSelectedEntities={setSelectedTeams}
      >
        Select the teams to populate:
      </EntitySelector>
      <div className="flex gap-3 ml-auto">
        <Button
          variant="outline"
          onClick={() => setState(Stages.SELECT_ACTION)}
        >
          Back
        </Button>
        <Button disabled={isProcessing} onClick={handleSeed}>
          {isProcessing ? "Seeding..." : "Seed"}
        </Button>
      </div>
      {error && <p className="text-destructive ml-auto">Error: {error}</p>}
    </>
  );
}

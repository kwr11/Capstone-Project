"use client";

import { batchMoveStudents } from "@/actions/student";
import { studentConverter } from "@/components/team-builder/students-list";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { doServerAction } from "@/lib/utils.client";

import { useState } from "react";

import { useSettings } from "@/components/settings-provider";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StudentRanker from "@/lib/ranking-algo";
import { Stages } from "./action-selector";
import { EntitySelector } from "./entity-selector";
import { MoveStudentArgs, SeedTeamsProps } from "./team-seeding";

export function PopulateTeams({
  courseId,
  sections,
  teams,
  students,
  router,
  setState,
}: SeedTeamsProps) {
  const [selectedSections, setSelectedSections] = useState<number[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [teamSize, setTeamSize] = useState<number>(2);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const { compMap } = useSettings();
  const ranker = new StudentRanker(compMap);

  const handlePopulate = async () => {
    setIsProcessing(true);

    const teamedStudents = new Set<number>();

    // Builds set of students in the selected teams
    for (const team of teams) {
      if (selectedTeams.includes(team.id)) {
        team.students.forEach((stud) => {
          teamedStudents.add(stud.id);
        });
      }
    }

    if (!teamedStudents.size) {
      setError("At least one team must be populated");
      setIsProcessing(false);
      return;
    }

    // Stores a list of arguments to send to the moveStudent function
    const moveStudentArgs: MoveStudentArgs = {
      courseId: courseId,
      moves: [],
    };

    // Ignores all empty teams
    const validTeamCount = teams
      .filter((team) => team.students.length > 0)
      .filter((team) => selectedTeams.includes(team.id)).length;

    // The number of students which need to be added to a team
    const studentsToTeam = teamSize * validTeamCount - teamedStudents.size;

    // Filters the teamed students out, and enforces the selected sections
    let availableStudents = students
      .filter((stud) => !teamedStudents.has(stud.id))
      .filter((stud) => selectedSections.includes(stud.section_id));

    // Fills the set with the teamed students NOT in the selected teams
    // Required for the suggestion algorithm
    for (const team of teams) {
      if (!selectedTeams.includes(team.id)) {
        team.students.forEach((stud) => {
          teamedStudents.add(stud.id);
        });
      }
    }

    for (let i = 0; i < studentsToTeam; undefined) {
      for (const team of teams) {
        // Ignore empty teams, full teams, and teams not selected for populating
        if (
          team.students.length === 0 ||
          team.students.length >= teamSize ||
          !selectedTeams.includes(team.id)
        )
          continue;

        // Converts the team into a usable formate
        const teamToCompare = team.students.map(studentConverter);

        // Generates the suggestion list for the current team
        const suggestions = ranker.generateSuggestions(
          teamToCompare,
          teamedStudents,
          availableStudents.map(studentConverter)
        );

        if (suggestions.length > 0) {
          const sectionId = availableStudents.find(
            (stud) => stud.id === suggestions[0].studentId
          )?.section_id;

          if (!sectionId) throw new Error("An unexpected error occurred");

          // Append to the args to be sent to the batch processing function
          moveStudentArgs.moves.push({
            sectionId: sectionId,
            studentId: suggestions[0].studentId,
            teamId: team.id,
          });

          // Adds the student to the teamed set and removes them from the available pool
          teamedStudents.add(suggestions[0].studentId);
          availableStudents = availableStudents.filter(
            (stud) => stud.id !== suggestions[0].studentId
          );
        }

        // Increments after every team loop since only 'studentsToTeam' students should be processed
        ++i;

        if (i >= studentsToTeam) break;
      }
    }

    // Early exit if no students were chosen in spite of the earlier guards
    // This should only happen if an insufficient number of students are available in
    //   the selected sections.
    if (moveStudentArgs.moves.length === 0) {
      setError("Unable to populate from the selected sections");
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
        <DialogTitle>Populate Teams</DialogTitle>
      </DialogHeader>
      <DialogDescription>
        All teams with at least one member will be populated up to the specified
        team size. Each team will take turns with their top pick until all teams
        have been filled.
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
      <Label>
        Team Size:
        <Input
          className="w-20"
          type="number"
          min={2}
          max={Math.ceil(students.length / teams.length)}
          value={teamSize}
          onChange={(e) => setTeamSize(Number(e.target.value))}
        />
      </Label>
      <div className="flex gap-3 ml-auto">
        <Button
          variant="outline"
          onClick={() => setState(Stages.SELECT_ACTION)}
        >
          Back
        </Button>
        <Button disabled={isProcessing} onClick={handlePopulate}>
          {isProcessing ? "Populating..." : "Populate"}
        </Button>
      </div>
      {error && <p className="text-destructive ml-auto">Error: {error}</p>}
    </>
  );
}

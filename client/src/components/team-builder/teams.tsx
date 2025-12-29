import _ from "lodash";
import {
  EditIcon,
  MoreVertical,
  PlusIcon,
  TrashIcon,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { doMoveStudent, TeamBuilderProcessingContext } from ".";
import { AddTeamDialog } from "../modals/team/create-team";
import { DeleteTeamDialog } from "../modals/team/delete-team";
import { EditTeamDialog } from "../modals/team/edit-team";
import { TeamBuilderContext } from "../team-builder-provider";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { StudentTile } from "./student-tile";
import { AutomateBuildDialog } from "../modals/team/automate-build";

export function TeamsList() {
  const course = useContext(TeamBuilderContext)!;

  const sortedTeams = course.teams
    ? _.sortBy(course.teams, ["name"])
    : undefined;

  const students = course.sections.map((sec) => sec.students).flat();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold mb-4">Teams</h2>
        <div className="flex gap-3">
          <AutomateBuildDialog
            courseId={course.id}
            courseName={course.name}
            teams={sortedTeams ?? []}
            students={students}
          >
            <Button variant="outline">
              <Workflow />
              Automation
            </Button>
          </AutomateBuildDialog>
          <AddTeamDialog courseId={course.id}>
            <Button variant="outline">
              <PlusIcon />
              Add Team
            </Button>
          </AddTeamDialog>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 overflow-y-auto">
        {sortedTeams && sortedTeams.length > 0 ? (
          sortedTeams.map((team) => {
            return <TeamTile team={team} key={team.id} />;
          })
        ) : (
          <p className="text-muted-foreground col-span-full">No teams yet</p>
        )}
      </div>
    </div>
  );
}

interface TeamTileProps {
  team: ITeam;
}

function TeamTile({ team }: TeamTileProps) {
  const router = useRouter();
  const processingContext = useContext(TeamBuilderProcessingContext);
  if (!processingContext) return;
  const { setIsProcessing } = processingContext;

  return (
    <div
      className="p-4 bg-card border border-border rounded-xl h-fit"
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => {
        if (e.dataTransfer.getData("application/json")) {
          e.preventDefault();
        }
      }}
      onDrop={doMoveStudent(team.course_id, team.id, router, setIsProcessing)}
    >
      <div className="flex justify-between">
        <h3 className="text-lg">
          <Link
            href={`/courses/${team.course_id}/teams/${team.id}`}
            className="hover:underline font-medium"
          >
            {team.name}
          </Link>
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <EditTeamDialog team={team}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <EditIcon />
                Edit Team
              </DropdownMenuItem>
            </EditTeamDialog>
            <DeleteTeamDialog team={team}>
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => e.preventDefault()}
              >
                <TrashIcon />
                Delete Team
              </DropdownMenuItem>
            </DeleteTeamDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(200px,100%),1fr))] gap-1 mt-2 [&>.student-tile]:self-start">
        {team.students.map((student) => {
          return <StudentTile student={student} key={student.id} />;
        })}
        {team.students.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">
            No students in team
          </p>
        )}
      </div>
    </div>
  );
}

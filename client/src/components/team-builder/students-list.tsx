import StudentRanker, { IAlgoStudent } from "@/lib/ranking-algo";
import { cn } from "@/lib/utils";
import _ from "lodash";
import { CheckIcon, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useMemo, useReducer, useState } from "react";
import { doMoveStudent, TeamBuilderProcessingContext } from ".";
import { useSettings } from "../settings-provider";
import { TeamBuilderContext } from "../team-builder-provider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { StudentTile } from "./student-tile";

type SectionIdsAction =
  | { type: "add"; id: number }
  | { type: "remove"; id: number }
  | { type: "reset" };

export function StudentsList() {
  // Get the optional `?team=` param from the URL
  const teamParam = useSearchParams().get("team");
  const teamSelected = teamParam ? Number(teamParam) : undefined;

  // Contexts
  const course = useContext(TeamBuilderContext)!;
  const processingContext = useContext(TeamBuilderProcessingContext);
  const { setIsProcessing } = processingContext!;

  // Recommendations
  const { compMap } = useSettings();
  const ranker = useMemo(() => {
    return new StudentRanker(compMap);
  }, [compMap]);

  // Searching, filtering
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterTeam, setFilterTeam] = useState<number | undefined>(
    teamSelected
  );

  // Maintain a list of selected section IDs (to show students from)
  // Contains logic to reset this array if all sections are checked
  const [sectionIds, dispatchSectionIds] = useReducer(
    (prev, action: SectionIdsAction) => {
      let newState = [...prev];

      if (action.type === "add") {
        newState.push(action.id);
      } else if (action.type === "remove") {
        newState = newState.filter((i) => i !== action.id);
      } else if (action.type === "reset") {
        return [];
      }

      if (newState.length === course.sections.length) {
        return [];
      }

      return newState;
    },
    [] as number[]
  );

  // Expanding all students at once
  const [isExpandAll, setIsExpandAll] = useState<boolean>(false);

  const router = useRouter();

  const students = useMemo(
    () =>
      _.sortBy(
        course.sections
          .reduce(
            (acc, section) => acc.concat(section.students),
            [] as IStudent[]
          )
          .filter(
            (s) => sectionIds.length === 0 || sectionIds.includes(s.section_id)
          ),
        // Sort by "Last, First"
        [(s) => s.name.split(" ").reverse().join(", ")]
      ),
    [course, sectionIds]
  );

  let recommendations: IStudentComparisonResult[] = [];

  // If a team is selected to recommend students for, set recommendations
  if (filterTeam) {
    // Get all students on the selected team
    // (the team where team.id is the ID in filterTeam)
    // or an empty array if the team can't be found
    // (should never happen)
    const currentTeamStudents =
      course.teams
        .find((t) => t.id === filterTeam)
        ?.students.map(studentConverter) || [];

    // A set of the IDs of all students who are currently
    // in a team
    const studentsInTeamsIDs = new Set(
      students.filter((s) => s.team_id !== null).map((s) => s.id)
    );

    recommendations = ranker.generateSuggestions(
      currentTeamStudents,
      studentsInTeamsIDs,
      students.map(studentConverter)
    );
  }

  let displayStudents: (IStudent & { comparison?: IStudentComparisonResult })[];

  if (filterTeam && recommendations && recommendations.length > 0) {
    // Display recommendations in-order
    displayStudents = recommendations.map((rec) => {
      return {
        ...students.find((s) => s.id === rec.studentId)!,
        comparison: rec,
      };
    });
  } else {
    displayStudents = students;
  }

  if (searchTerm.trim() !== "") {
    // Display in alphabetical order (`students`), but filter
    const wellFormedSearchTerm = searchTerm.trim().toLowerCase();

    displayStudents = displayStudents.filter((stud) => {
      for (const key of [
        "name",
        "major",
        "email",
        "languages",
        "frameworks",
        "work_with",
        "dont_work_with",
      ] as const) {
        if (Array.isArray(stud[key])) {
          if (
            stud[key].some((value) => {
              if (typeof value === "object" && "name" in value) {
                return value.name
                  .trim()
                  .toLowerCase()
                  .includes(wellFormedSearchTerm);
              }

              return value.trim().toLowerCase().includes(wellFormedSearchTerm);
            })
          )
            return true;
        } else if (
          stud[key] &&
          stud[key].trim().toLowerCase().includes(wellFormedSearchTerm)
        ) {
          return true;
        }
      }

      return false;
    });
  }

  return (
    <div
      className="h-0 min-h-full flex flex-col gap-2 border-r border-muted pr-4"
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => {
        if (e.dataTransfer.getData("application/json")) {
          e.preventDefault();
        }
      }}
      onDrop={doMoveStudent(course.id, null, router, setIsProcessing)}
    >
      <div>
        <h2 className="text-2xl font-semibold">Students</h2>
        <p className="text-sm text-muted-foreground">
          Drag students to add to teams
        </p>
      </div>
      <div className="py-2 border-y border-border grid gap-2">
        <Input
          type="search"
          placeholder="Name, major, work with, etc."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
        />
        <Select
          name="team"
          defaultValue={String(filterTeam || -1)}
          onValueChange={(val) => {
            if (val === "-1") {
              setFilterTeam(undefined);
            } else {
              setFilterTeam(Number(val));
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a team" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="-1">All Teams</SelectItem>
              {course.teams.map((team) => {
                return (
                  <SelectItem value={String(team.id)} key={team.id}>
                    {team.name}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex gap-1 flex-wrap">
          <label className="py-1 px-3 flex items-center font-medium text-sm rounded-full border border-border text-foreground bg-card has-checked:border-transparent has-checked:bg-foreground has-checked:text-background cursor-pointer">
            <CheckIcon
              className={cn(
                "size-0 transition-all",
                sectionIds.length === 0 && "size-5 pr-1"
              )}
            />
            All Sections
            <input
              type="checkbox"
              className="sr-only"
              name="__"
              id="__"
              onChange={() => dispatchSectionIds({ type: "reset" })}
              checked={sectionIds.length === 0}
            />
          </label>
          {course.sections.map((section) => {
            return (
              <label
                htmlFor={`section-${section.id}`}
                className="py-1 px-3 flex items-center font-medium text-sm rounded-full border border-border text-foreground bg-card has-checked:border-transparent has-checked:bg-foreground has-checked:text-background cursor-pointer"
                key={section.id}
              >
                <input
                  className="sr-only"
                  type="checkbox"
                  name={`section-${section.id}`}
                  id={`section-${section.id}`}
                  checked={sectionIds.includes(section.id)}
                  onChange={(e) => {
                    if (e.currentTarget.checked) {
                      dispatchSectionIds({ type: "add", id: section.id });
                    } else {
                      dispatchSectionIds({ type: "remove", id: section.id });
                    }
                  }}
                />
                <CheckIcon
                  size={14}
                  className={cn(
                    "size-0 transition-all",
                    sectionIds.includes(section.id) && "size-5 pr-1"
                  )}
                />
                {section.name}
              </label>
            );
          })}
        </div>
      </div>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => {
          setIsExpandAll(!isExpandAll);
        }}
      >
        <ChevronRight
          className={cn("transition-transform", isExpandAll && "rotate-90")}
        />
        {isExpandAll ? "Collapse" : "Expand"} All
      </Button>
      <div className="h-full overflow-auto flex flex-col gap-1 pr-1">
        {displayStudents.map((student) => {
          return (
            <StudentTile
              isExpandAll={isExpandAll}
              student={student}
              key={student.id}
              comparison={student.comparison}
            />
          );
        })}
      </div>
    </div>
  );
}

export function studentConverter(stud: IStudent): IAlgoStudent {
  return {
    ...stud,
    languages: stud.languages?.map((l) => l.name) || [],
    frameworks: stud.frameworks?.map((f) => f.name) || [],
    expertise: stud.expertise || 0,
    leadership: stud.leadership || 0,
    team_id: stud.team_id || -1,
  };
}

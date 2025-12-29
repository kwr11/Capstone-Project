import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { StudentDragData } from ".";

interface StudentTileProps {
  student: IStudent;
  comparison?: IStudentComparisonResult;
  isExpandAll?: boolean;
}

export function StudentTile({
  isExpandAll,
  student,
  comparison,
}: StudentTileProps) {
  const [isTileOpen, setIsTileOpen] = useState<boolean>(false);
  const isExpanded = isTileOpen || isExpandAll;

  return (
    <div
      className={`student-tile grid grid-cols-[max-content_1fr] items-center grid-rows-[max-content_1fr] gap-x-2 border border-border rounded-md p-3 cursor-grab active:cursor-grabbing ${
        student.team_id === null ? "bg-card" : "bg-background"
      }`}
      draggable
      onDragStart={(e) => {
        const dragData: StudentDragData = student;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("application/json", JSON.stringify(dragData));
      }}
    >
      <ChevronRight
        size={16}
        className={cn(
          "cursor-pointer transition-transform",
          isExpanded && "rotate-90"
        )}
        onClick={() => {
          setIsTileOpen((o) => !o);
        }}
      />
      <h3 className="leading-none font-semibold flex gap-2 items-center">
        <Link
          href={`/courses/${student.course_id}/students/${student.id}`}
          className="hover:underline"
        >
          {student.name}
        </Link>
        {comparison && comparison.weight > Number.NEGATIVE_INFINITY && (
          <span className="text-muted-foreground text-xs">
            {" "}
            ({comparison.weight})
          </span>
        )}
      </h3>
      <ul
        className={cn(
          "col-span-full self-start text-sm text-muted-foreground opacity-0 h-0 overflow-hidden transition-discrete [interpolate-size:allow-keywords] ease-in-out transition-all",
          isExpanded && "h-auto mt-2 opacity-100"
        )}
      >
        <StudentStat
          accessKey="major"
          label="Major"
          value={student.major}
          comparison={comparison}
        />
        <StudentStat
          accessKey="leadership"
          label="Leadership"
          value={student.leadership}
          comparison={comparison}
        />
        <StudentStat
          accessKey="expertise"
          label="Expertise"
          value={student.expertise}
          comparison={comparison}
        />
        <StudentStat
          accessKey="languages"
          label="Languages"
          value={student.languages}
          comparison={comparison}
        />
        <StudentStat
          accessKey="frameworks"
          label="Frameworks"
          value={student.frameworks}
          comparison={comparison}
        />
        <StudentStat
          accessKey="work_with"
          label="Work with"
          value={student.work_with}
          comparison={comparison}
        />
        <StudentStat
          accessKey="dont_work_with"
          label="Don't work with"
          value={student.dont_work_with}
          comparison={comparison}
        />
      </ul>
    </div>
  );
}

interface StudentStatProps<TAccessKey extends keyof IStudentComparisonMap> {
  accessKey: TAccessKey;
  label: string;
  value: IStudent[TAccessKey];
  comparison?: IStudentComparisonResult;
}

function StudentStat<TAccessKey extends keyof IStudentComparisonMap>({
  accessKey,
  label,
  value,
  comparison,
}: StudentStatProps<TAccessKey>) {
  const colorClass = isKeyPassing(accessKey, comparison)
    ? accessKey === "dont_work_with"
      ? "text-destructive font-semibold"
      : "text-primary font-semibold"
    : "text-foreground";

  if (accessKey === "languages" || accessKey === "frameworks") {
    const val = value as IStudent["languages"];

    return (
      <li>
        <span className={colorClass}>{label}</span>:{" "}
        {val.length === 0 ? "N/A" : val.map((val) => val.name).join(", ")}
      </li>
    );
  }

  return (
    <li>
      <span className={colorClass}>{label}</span>:{" "}
      {Array.isArray(value)
        ? value.length > 0
          ? value.join(", ")
          : "N/A"
        : value || "N/A"}
    </li>
  );
}

function isKeyPassing(
  key: keyof IStudentComparisonMap,
  comparison?: IStudentComparisonResult
): boolean {
  if (!comparison) return false;

  const flagDetail = comparison.flagDetails.find(
    (detail) => detail.key === key
  );
  if (!flagDetail) return false;

  return flagDetail.failedFlags.length === 0;
}

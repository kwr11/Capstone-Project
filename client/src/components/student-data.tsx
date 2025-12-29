import Link from "next/link";

interface StudentLinksProps {
  course: ICourse;
  section: ISection;
  student: IStudent;
  team?: ITeam;
}

export function StudentLinks({
  course,
  section,
  student,
  team,
}: StudentLinksProps) {
  return (
    <ul className="list-disc list-inside flex flex-col gap-2">
      <li>
        {team && (
          <>
            Team:{" "}
            <Link
              className="falafel-link"
              href={`/courses/${course.id}/teams/${team.id}`}
            >
              {team.name}
            </Link>
          </>
        )}
        {!team && `${student.name} is not on a team`}
      </li>
      <li>
        Section:{" "}
        <Link
          className="falafel-link"
          href={`/courses/${course.id}/sections/${section.id}`}
        >
          {section.name}
        </Link>
      </li>
      <li>
        Course:{" "}
        <Link className="falafel-link" href={`/courses/${course.id}`}>
          {course.name}
        </Link>
      </li>
    </ul>
  );
}

interface StudentDataProps {
  student: IStudent;
}

export function StudentData({ student }: StudentDataProps) {
  return (
    <ul className="list-disc list-inside flex flex-col gap-2">
      <li>Major: {student.major || "N/A"}</li>
      <li>Leadership: {student.leadership || "N/A"}</li>
      <li>Expertise: {student.expertise || "N/A"}</li>
      <li>
        Languages: {student.languages?.map((l) => l.name).join(", ") || "N/A"}
      </li>
      <li>
        Frameworks: {student.frameworks?.map((f) => f.name).join(", ") || "N/A"}
      </li>
      <li>Work With: {student.work_with?.join(", ") || "N/A"}</li>
      <li>
        {"Don't Work With:"} {student.dont_work_with?.join(", ") || "N/A"}
      </li>
    </ul>
  );
}

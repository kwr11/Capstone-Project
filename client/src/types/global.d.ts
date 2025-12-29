interface IUser {
  sub: number;
  email: string;
}

interface ILabel {
  id: number;
  ownerId: number;
  name: string;
  color: string;
}

interface ICourse {
  id: number;
  owner_id: number;
  name: string;
  code: string;
  term: string;
  sections: ISection[];
  teams: ITeam[];
  created_at: Date | string;
}

interface ISection {
  id: number;
  name: string;
  course_id: number;
  course_name: string;
  students: IStudent[];
  created_at: Date | string;
}

interface IStudentTeam {
  id: number;
  name: string;
  course: string;
  courseId: number;
  sectionId: number;
  type: "Student" | "Team";
  email: FALAFELLink[];
  labels: ILabel[];
}

interface ITeam {
  id: number;
  name: string;
  course_id: number;
  comments: IComment[];
  labels: ILabel[];
  students: IStudent[];
  created_at: Date | string;
}

interface IStudent {
  id: number;
  course_id: number;
  section_id: number;
  team_id: number | null;
  name: string;
  email: string;
  major: string;
  comments: IComment[];
  labels: ILabel[];
  leadership: number | null;
  expertise: number | null;
  languages: IExperience[];
  frameworks: IExperience[];
  work_with: string[];
  dont_work_with: string[];
  created_at: Date | string;
}

interface IComment {
  id: number;
  team_id?: number;
  student_id?: number;
  content: string;
  created_at: Date | string;
}

interface IExperience {
  id: number;
  name: string;
}

interface ILinkComponent {
  label: string;
  url: string;
}

interface IFlagInfo {
  flags: string[];
  weight: number;
  type?: "external" | "internal";
  difference?: number;
}

interface IStudentComparisonMap {
  section_id: IFlagInfo;
  major: IFlagInfo;
  leadership: IFlagInfo;
  expertise: IFlagInfo;
  languages: IFlagInfo;
  frameworks: IFlagInfo;
  work_with: IFlagInfo;
  dont_work_with: IFlagInfo;
}

interface IFlagCompDetails {
  key: string; // e.g. "sectionId"
  passedFlags: string[]; // e.g. ["not_shared"]
  failedFlags: string[];
}

interface IStudentComparisonResult {
  studentId: number;
  weight: number;
  flagDetails: IFlagCompDetails[];
}

interface IRecentActivity {
  label: string;
  url: string;
}

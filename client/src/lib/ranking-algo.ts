import _ from "lodash";

export interface IAlgoStudent {
  id: number;
  course_id: number;
  section_id: number;
  team_id: number;
  name: string;
  email: string;
  major: string;
  comments: IComment[];
  labels: ILabel[];
  leadership: number;
  expertise: number;
  languages: string[];
  frameworks: string[];
  work_with: string[];
  dont_work_with: string[];
  created_at: Date | string;
}

// Composite partial student, containing only the information relevant for comparisons.
interface ICompositeStudent {
  section_id: number;
  names: string[];
  major: string[];
  leadership: number;
  expertise: number;
  languages: string[];
  frameworks: string[];
  work_with: string[];
  dont_work_with: string[];
}

// Represents all possible types in ICompositeStudent
type ComparisonType = string | string[] | number;

export enum Flags {
  Shared = "shared",
  NotShared = "not_shared",
  Proximity = "proximity",
  WorkWith = "work_with",
  DontWorkWith = "dont_work_with",
  Equal = "equal",
  NotTeamed = "not_teamed", // Used for special check after all other comparisons
  NonNull = "non_null",
}

export default class StudentRanker {
  private defaultMap: IStudentComparisonMap | undefined;

  /**
   * Generates a 'composite' student from the given team to represent it for comparisons.
   *
   * @param currentTeam - A list of students in the team of which to build a composite for.
   * @returns a partial student object representing a composite average of all of the students
   *   in the team.
   */
  private generateCompositeStudent(
    currentTeam: IAlgoStudent[]
  ): ICompositeStudent | null {
    if (!currentTeam || currentTeam.length === 0) return null;

    const composite = currentTeam.reduce<ICompositeStudent>((acc, stud, i) => {
      if (i === 0) {
        return {
          section_id: stud.section_id,
          names: [stud.name],
          major: [stud.major],
          leadership: stud.leadership,
          expertise: stud.expertise,
          languages: [...stud.languages],
          frameworks: [...stud.frameworks],
          work_with: [...stud.work_with],
          dont_work_with: [...stud.dont_work_with],
        };
      } else {
        if (!acc.names.includes(stud.name)) acc.names.push(stud.name);
        if (!acc.major.includes(stud.major)) acc.major.push(stud.major);
        acc.leadership += stud.leadership;
        acc.expertise += stud.expertise;

        stud.languages.forEach((lang) => {
          if (!acc.languages.includes(lang)) acc.languages.push(lang);
        });
        stud.frameworks.forEach((framework) => {
          if (!acc.frameworks.includes(framework))
            acc.frameworks.push(framework);
        });
        stud.work_with.forEach((workWith) => {
          if (!acc.work_with.includes(workWith)) acc.work_with.push(workWith);
        });
        stud.dont_work_with.forEach((dontWorkWith) => {
          if (!acc.dont_work_with.includes(dontWorkWith))
            acc.dont_work_with.push(dontWorkWith);
        });

        return acc;
      }
    }, {} as ICompositeStudent);

    composite.leadership /= currentTeam.length;
    composite.expertise /= currentTeam.length;

    return composite;
  }

  /**
   * Checks for deep equality, with order independence for arrays.
   *
   * @param col - The name of the column for the value comparison.
   * @param valueA - The value of the composite student on the column.
   * @param valueB - The value of the comparing student on the column.
   * @returns true if equal, and false if not.
   */
  private isEqual(
    col: keyof IStudentComparisonMap,
    valueA: ComparisonType,
    valueB: ComparisonType
  ): boolean {
    // Special case for the major column
    if (col === "major") {
      // Composite major column must be an array, while the student's must be a string
      if (!Array.isArray(valueA) || typeof valueB !== "string") return false;

      // Returns false if more or less than a single major is present in the composite
      if (valueA.length !== 1) return false;

      // Returns true if the composite's major matches the student's
      return valueA[0] === valueB;
    }

    // Early return on differing types
    if (typeof valueA !== typeof valueB) return false;

    // Lodash object comparison for non-arrays
    if (typeof valueA === "object" && !Array.isArray(valueA) && valueA !== null)
      return _.isEqual(valueA, valueB);

    // Direct comparison for non-arrays
    if (!Array.isArray(valueA) || !Array.isArray(valueB))
      return valueA === valueB;

    // Quick checks to avoid further computation if possible
    if (valueA.length !== valueB.length) return false;
    if (valueA.length === 0) return true;

    // Checks for order independent deep equality.
    for (const item of valueA) {
      if (!valueB.includes(item)) return false;
    }

    return true;
  }

  /**
   * Checks for any shared value between the two value arguments, returning true if one is found, and false otherwise.
   *
   * @param col - The name of the column for the value comparison.
   * @param valueA - The value of the composite student on the column.
   * @param valueB - The value of the comparing student on the column.
   * @returns true if any overlap, and false if not.
   */
  private anyShared(valueA: ComparisonType, valueB: ComparisonType): boolean {
    // If both are arrays, checks every item within each array against each other
    if (Array.isArray(valueA) && Array.isArray(valueB)) {
      return valueA.some((val) => valueB.includes(val));
    }

    // If only valueA is an array, checks for valueB's presence within it
    if (Array.isArray(valueA)) {
      return valueA.includes(valueB as string);
    }

    // If only valueB is an array, checks for valueA's presence within it
    if (Array.isArray(valueB)) {
      return valueB.includes(valueA as string);
    }

    // If neither are arrays, performs a direct comparison instead
    return valueA === valueB;
  }

  /**
   * Determines the proximity of two given number values.
   *
   * @param type - The type of proximity comparison, either 'external' or 'internal'.
   * @param difference - The range boundary to check.
   * @param valueA - The composite student's value for a given column.
   * @param valueB - The comparing student's value for a given column.
   * @returns true if within the boundary for 'internal' types, or outside of the boundary for
   *   'external' types. Always returns false otherwise.
   */
  private inProximity(
    type: string | undefined,
    difference: number | undefined,
    valueA: ComparisonType,
    valueB: ComparisonType
  ): boolean {
    if (
      !type ||
      !difference ||
      typeof valueA !== "number" ||
      typeof valueB !== "number"
    )
      return false;

    switch (type) {
      case "external":
        return Math.abs(valueA - valueB) >= difference;
      case "internal":
        return Math.abs(valueA - valueB) <= difference;
      default:
        throw new Error("Malformed comparison map");
    }
  }

  /**
   * Checks if any student which formed the composite student mentioned the comparing student in the
   * given list, and vice versa.
   *
   * @param compositeList - The composite's list to compare.
   * @param studentList - The comparing student's list to compare.
   * @param compositeNames - List of names which comprise the composite student.
   * @param studentName - The comparing student's name.
   * @returns true if a match is found, and false if not.
   */
  private nameListMatch(
    compositeList: ComparisonType,
    studentList: ComparisonType,
    compositeNames: string[],
    studentName: string
  ): boolean {
    if (!Array.isArray(compositeList) || !Array.isArray(studentList))
      throw new Error("Malformed comparison map");

    // Check if compared student is mentioned in the composite student's list
    if (compositeList.includes(studentName)) return true;

    // Check if a composite student's name is mentioned in the comparing student's list
    for (const name of compositeNames) {
      if (studentList.includes(name)) return true;
    }

    return false;
  }

  /**
   * Compares a student with the given composite and returns the results.
   *
   * @param composite - A composite student formed from one or more teamed students.
   * @param student - A student to compare to the composite.
   * @param compMap - A comparison map dictating what and how to compare, as well as the weights to apply.
   * @param teamedStudents - A set of names of all of the available students who are already teamed.
   * @returns the results of the comparison.
   */
  private compareStudent(
    composite: ICompositeStudent,
    student: IAlgoStudent,
    compMap: IStudentComparisonMap,
    teamedStudents: Set<number>
  ): IStudentComparisonResult {
    const studentId: number = student.id;
    const flagDetails: IFlagCompDetails[] = [];
    let totalWeight: number = 0;

    // Compare each entry in student with each flag in the provided comparison map
    (
      Object.entries(compMap) as [keyof IStudentComparisonMap, IFlagInfo][]
    ).forEach(([col, flagInfo]) => {
      const valueA: ComparisonType = composite[col];
      const valueB: ComparisonType = student[col];
      const passingFlags: string[] = [];
      const failingFlags: string[] = [];

      flagInfo.flags.forEach((flag) => {
        switch (flag) {
          case Flags.Shared:
            if (this.anyShared(valueA, valueB)) {
              passingFlags.push(flag);
            } else {
              failingFlags.push(flag);
            }
            break;
          case Flags.NotShared:
            if (!this.anyShared(valueA, valueB)) {
              passingFlags.push(flag);
            } else {
              failingFlags.push(flag);
            }
            break;
          case Flags.Proximity:
            if (
              this.inProximity(
                flagInfo.type,
                flagInfo.difference,
                valueA,
                valueB
              )
            ) {
              passingFlags.push(flag);
            } else {
              failingFlags.push(flag);
            }
            break;
          case Flags.WorkWith:
          case Flags.DontWorkWith:
            if (
              this.nameListMatch(valueA, valueB, composite.names, student.name)
            ) {
              passingFlags.push(flag);
            } else {
              failingFlags.push(flag);
            }
            break;
          case Flags.Equal:
            if (this.isEqual(col, valueA, valueB)) {
              passingFlags.push(flag);
            } else {
              failingFlags.push(flag);
            }
            break;
          case Flags.NonNull:
            if (
              (Array.isArray(valueB) && valueB.length > 0) ||
              (!Array.isArray(valueB) && !!valueB)
            ) {
              passingFlags.push(flag);
            } else {
              failingFlags.push(flag);
            }
            break;
          default:
            throw new Error("Malformed comparison map");
        }
      });

      if (passingFlags.length === flagInfo.flags.length) {
        totalWeight += flagInfo.weight;
      }

      flagDetails.push({
        key: col,
        passedFlags: passingFlags,
        failedFlags: failingFlags,
      });
    });

    // Check for unavailability
    const alreadyTeamed = teamedStudents.has(studentId);
    if (alreadyTeamed) {
      totalWeight = Number.NEGATIVE_INFINITY;
      flagDetails.push({
        key: "student_id",
        passedFlags: [Flags.NotTeamed],
        failedFlags: [],
      });
    }

    return {
      studentId: studentId,
      weight: totalWeight,
      flagDetails: flagDetails,
    };
  }

  /**
   * Generates a list of teammate suggestions in descending compatibility order.
   *
   * @param currentTeam - A list of students in the team of which to build suggestions for.
   * @param teamedStudents - A set of student ids for all students already in a team. Used to
   *   maximally deprioritize already teamed students.
   * @param courseStudents - A list of all of the students available to be teamed.
   * @param compMap - A user-built object which determines comparisons and weights.
   * @returns - A list of teammate suggestions for the given team in descending compatibility order.
   */
  public generateSuggestions(
    currentTeam: IAlgoStudent[],
    teamedStudents: Set<number>,
    courseStudents: IAlgoStudent[],
    compMap?: IStudentComparisonMap
  ): IStudentComparisonResult[] {
    const composite = this.generateCompositeStudent(currentTeam);
    if (!composite) return [];
    if (!compMap && !this.defaultMap)
      throw new Error("Must have comp map designated");

    const compResults = courseStudents.map((stud) =>
      this.compareStudent(
        composite,
        stud,
        (compMap || this.defaultMap)!,
        teamedStudents
      )
    );

    // Sorts results into descending weighted order
    const results = compResults.sort((a, b) => b.weight - a.weight);

    return results;
  }

  constructor(map?: IStudentComparisonMap) {
    this.defaultMap = map;
  }
}

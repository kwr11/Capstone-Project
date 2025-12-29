import "@testing-library/jest-dom";
import StudentRanker from "../src/lib/ranking-algo";

const team = [
  {
    id: 0,
    course_id: 0,
    section_id: 0,
    team_id: 0,
    name: "John Doe",
    email: "john@example.com",
    major: "Computer Science",
    comments: [],
    labels: [],
    leadership: 8,
    expertise: 8,
    languages: ["Python", "Typescript"],
    frameworks: ["Flask", "NextJS"],
    work_with: ["Jane Doe", "Billy Bob"],
    dont_work_with: ["Jill Jackson"],
    created_at: new Date(),
  },
  {
    id: 1,
    course_id: 0,
    section_id: 0,
    team_id: 0,
    name: "Jane Doe",
    email: "jane@example.com",
    major: "Computer Science",
    comments: [],
    labels: [],
    leadership: 3,
    expertise: 6,
    languages: ["Python", "C++"],
    frameworks: ["Flask", "Django"],
    work_with: ["John Doe", "Billy Bob"],
    dont_work_with: ["Jill Jackson"],
    created_at: new Date(),
  },
];

const compositeStudent = {
  section_id: 0,
  names: ["John Doe", "Jane Doe"],
  major: ["Computer Science"],
  leadership: 5.5,
  expertise: 7,
  languages: ["Python", "Typescript", "C++"],
  frameworks: ["Flask", "NextJS", "Django"],
  work_with: ["Jane Doe", "Billy Bob", "John Doe"],
  dont_work_with: ["Jill Jackson"],
};

const teamedStudents = new Set([0, 1]);

const students = [
  {
    id: 0,
    course_id: 0,
    section_id: 0,
    team_id: 0,
    name: "John Doe",
    email: "john@example.com",
    major: "Computer Science",
    comments: [],
    labels: [],
    leadership: 8,
    expertise: 8,
    languages: ["Python", "Typescript"],
    frameworks: ["Flask", "NextJS"],
    work_with: ["Jane Doe", "Billy Bob"],
    dont_work_with: ["Jill Jackson"],
    created_at: new Date(),
  },
  {
    id: 1,
    course_id: 0,
    section_id: 0,
    team_id: 0,
    name: "Jane Doe",
    email: "jane@example.com",
    major: "Computer Science",
    comments: [],
    labels: [],
    leadership: 3,
    expertise: 6,
    languages: ["Python", "C++"],
    frameworks: ["Flask", "Django"],
    work_with: ["John Doe", "Billy Bob"],
    dont_work_with: ["Jill Jackson"],
    created_at: new Date(),
  },
  {
    id: 2,
    course_id: 0,
    section_id: 0,
    team_id: -1,
    name: "Billy Bob",
    email: "billy@example.com",
    major: "Cybersecurity",
    comments: [],
    labels: [],
    leadership: 10,
    expertise: 9,
    languages: [],
    frameworks: [],
    work_with: ["John Doe", "Jane Doe"],
    dont_work_with: ["Jill Jackson"],
    created_at: new Date(),
  },
  {
    id: 3,
    course_id: 0,
    section_id: 0,
    team_id: -1,
    name: "Jill Jackson",
    email: "jill@example.com",
    major: "Software Development",
    comments: [],
    labels: [],
    leadership: 2,
    expertise: 3,
    languages: [],
    frameworks: [],
    work_with: ["John Doe", "Jane Doe", "Billy Bob"],
    dont_work_with: [],
    created_at: new Date(),
  },
  {
    id: 4,
    course_id: 0,
    section_id: 0,
    team_id: -1,
    name: "Sandra Brooks",
    email: "sandra@example.com",
    major: "Computer Science",
    comments: [],
    labels: [],
    leadership: 5,
    expertise: 6,
    languages: [],
    frameworks: [],
    work_with: [],
    dont_work_with: [],
    created_at: new Date(),
  },
  {
    id: 5,
    course_id: 0,
    section_id: 0,
    team_id: -1,
    name: "Brandon Somerset",
    email: "brandon@example.com",
    major: "Computer Science",
    comments: [],
    labels: [],
    leadership: 8,
    expertise: 4,
    languages: [],
    frameworks: [],
    work_with: [],
    dont_work_with: [],
    created_at: new Date(),
  },
  {
    id: 6,
    course_id: 0,
    section_id: 1,
    team_id: -1,
    name: "Brandon Somerset",
    email: "brandon@example.com",
    major: "Computer Science",
    comments: [],
    labels: [],
    leadership: 8,
    expertise: 4,
    languages: [],
    frameworks: [],
    work_with: [],
    dont_work_with: [],
    created_at: new Date(),
  },
];

const compMap = {
  section_id: {
    flags: ["not_shared"],
    weight: Number.NEGATIVE_INFINITY,
  },
  major: {
    flags: ["not_shared"],
    weight: 3,
  },
  leadership: {
    flags: ["proximity"],
    type: "external",
    difference: 2,
    weight: 2,
  },
  expertise: {
    flags: ["proximity"],
    type: "internal",
    difference: 4,
    weight: 2,
  },
  languages: {
    flags: ["shared"],
    weight: 3,
  },
  frameworks: {
    flags: ["not_shared", "non_null"],
    weight: 3,
  },
  work_with: {
    flags: ["work_with"],
    weight: 5,
  },
  dont_work_with: {
    flags: ["dont_work_with"],
    weight: Number.NEGATIVE_INFINITY,
  },
};

const comparisonResults = [
  {
    "studentId": 2,
    "weight": 12,
    "flagDetails": [
      {
        "key": "section_id",
        "passedFlags": [],
        "failedFlags": ["not_shared"],
      },
      {
        "key": "major",
        "passedFlags": ["not_shared"],
        "failedFlags": [],
      },
      {
        "key": "leadership",
        "passedFlags": ["proximity"],
        "failedFlags": [],
      },
      {
        "key": "expertise",
        "passedFlags": ["proximity"],
        "failedFlags": [],
      },
      {
        "key": "languages",
        "passedFlags": [],
        "failedFlags": ["shared"],
      },
      {
        "key": "frameworks",
        "passedFlags": ["not_shared"],
        "failedFlags": ["non_null"],
      },
      {
        "key": "work_with",
        "passedFlags": ["work_with"],
        "failedFlags": [],
      },
      {
        "key": "dont_work_with",
        "passedFlags": [],
        "failedFlags": ["dont_work_with"],
      },
    ],
  },
  {
    "studentId": 5,
    "weight": 4,
    "flagDetails": [
      {
        "key": "section_id",
        "passedFlags": [],
        "failedFlags": ["not_shared"],
      },
      {
        "key": "major",
        "passedFlags": [],
        "failedFlags": ["not_shared"],
      },
      {
        "key": "leadership",
        "passedFlags": ["proximity"],
        "failedFlags": [],
      },
      {
        "key": "expertise",
        "passedFlags": ["proximity"],
        "failedFlags": [],
      },
      {
        "key": "languages",
        "passedFlags": [],
        "failedFlags": ["shared"],
      },
      {
        "key": "frameworks",
        "passedFlags": ["not_shared"],
        "failedFlags": ["non_null"],
      },
      {
        "key": "work_with",
        "passedFlags": [],
        "failedFlags": ["work_with"],
      },
      {
        "key": "dont_work_with",
        "passedFlags": [],
        "failedFlags": ["dont_work_with"],
      },
    ],
  },
  {
    "studentId": 4,
    "weight": 2,
    "flagDetails": [
      {
        "key": "section_id",
        "passedFlags": [],
        "failedFlags": ["not_shared"],
      },
      {
        "key": "major",
        "passedFlags": [],
        "failedFlags": ["not_shared"],
      },
      {
        "key": "leadership",
        "passedFlags": [],
        "failedFlags": ["proximity"],
      },
      {
        "key": "expertise",
        "passedFlags": ["proximity"],
        "failedFlags": [],
      },
      {
        "key": "languages",
        "passedFlags": [],
        "failedFlags": ["shared"],
      },
      {
        "key": "frameworks",
        "passedFlags": ["not_shared"],
        "failedFlags": ["non_null"],
      },
      {
        "key": "work_with",
        "passedFlags": [],
        "failedFlags": ["work_with"],
      },
      {
        "key": "dont_work_with",
        "passedFlags": [],
        "failedFlags": ["dont_work_with"],
      },
    ],
  },
  {
    "studentId": 0,
    "weight": -Infinity,
    "flagDetails": [
      {
        "key": "section_id",
        "passedFlags": [],
        "failedFlags": ["not_shared"],
      },
      {
        "key": "major",
        "passedFlags": [],
        "failedFlags": ["not_shared"],
      },
      {
        "key": "leadership",
        "passedFlags": ["proximity"],
        "failedFlags": [],
      },
      {
        "key": "expertise",
        "passedFlags": ["proximity"],
        "failedFlags": [],
      },
      {
        "key": "languages",
        "passedFlags": ["shared"],
        "failedFlags": [],
      },
      {
        "key": "frameworks",
        "passedFlags": ["non_null"],
        "failedFlags": ["not_shared"],
      },
      {
        "key": "work_with",
        "passedFlags": ["work_with"],
        "failedFlags": [],
      },
      {
        "key": "dont_work_with",
        "passedFlags": [],
        "failedFlags": ["dont_work_with"],
      },
      {
        "key": "student_id",
        "passedFlags": ["not_teamed"],
        "failedFlags": [],
      },
    ],
  },
  {
    "studentId": 1,
    "weight": -Infinity,
    "flagDetails": [
      {
        "key": "section_id",
        "passedFlags": [],
        "failedFlags": ["not_shared"],
      },
      {
        "key": "major",
        "passedFlags": [],
        "failedFlags": ["not_shared"],
      },
      {
        "key": "leadership",
        "passedFlags": ["proximity"],
        "failedFlags": [],
      },
      {
        "key": "expertise",
        "passedFlags": ["proximity"],
        "failedFlags": [],
      },
      {
        "key": "languages",
        "passedFlags": ["shared"],
        "failedFlags": [],
      },
      {
        "key": "frameworks",
        "passedFlags": ["non_null"],
        "failedFlags": ["not_shared"],
      },
      {
        "key": "work_with",
        "passedFlags": ["work_with"],
        "failedFlags": [],
      },
      {
        "key": "dont_work_with",
        "passedFlags": [],
        "failedFlags": ["dont_work_with"],
      },
      {
        "key": "student_id",
        "passedFlags": ["not_teamed"],
        "failedFlags": [],
      },
    ],
  },
  {
    "studentId": 3,
    "weight": -Infinity,
    "flagDetails": [
      {
        "key": "section_id",
        "passedFlags": [],
        "failedFlags": ["not_shared"],
      },
      {
        "key": "major",
        "passedFlags": ["not_shared"],
        "failedFlags": [],
      },
      {
        "key": "leadership",
        "passedFlags": ["proximity"],
        "failedFlags": [],
      },
      {
        "key": "expertise",
        "passedFlags": ["proximity"],
        "failedFlags": [],
      },
      {
        "key": "languages",
        "passedFlags": [],
        "failedFlags": ["shared"],
      },
      {
        "key": "frameworks",
        "passedFlags": ["not_shared"],
        "failedFlags": ["non_null"],
      },
      {
        "key": "work_with",
        "passedFlags": ["work_with"],
        "failedFlags": [],
      },
      {
        "key": "dont_work_with",
        "passedFlags": ["dont_work_with"],
        "failedFlags": [],
      },
    ],
  },
  {
    "studentId": 6,
    "weight": -Infinity,
    "flagDetails": [
      {
        "key": "section_id",
        "passedFlags": ["not_shared"],
        "failedFlags": [],
      },
      {
        "key": "major",
        "passedFlags": [],
        "failedFlags": ["not_shared"],
      },
      {
        "key": "leadership",
        "passedFlags": ["proximity"],
        "failedFlags": [],
      },
      {
        "key": "expertise",
        "passedFlags": ["proximity"],
        "failedFlags": [],
      },
      {
        "key": "languages",
        "passedFlags": [],
        "failedFlags": ["shared"],
      },
      {
        "key": "frameworks",
        "passedFlags": ["not_shared"],
        "failedFlags": ["non_null"],
      },
      {
        "key": "work_with",
        "passedFlags": [],
        "failedFlags": ["work_with"],
      },
      {
        "key": "dont_work_with",
        "passedFlags": [],
        "failedFlags": ["dont_work_with"],
      },
    ],
  },
];

describe("Student Ranker class tests", () => {
  describe("Composite student generation", () => {
    it("generates a null composite student", () => {
      const ranker = new StudentRanker();
      expect(ranker.generateCompositeStudent()).toBe(null);
    });

    it("generates a composite student from one student", () => {
      const ranker = new StudentRanker();
      expect(ranker.generateCompositeStudent([students[0]])).toStrictEqual({
        section_id: students[0].section_id,
        names: [students[0].name],
        major: [students[0].major],
        leadership: students[0].leadership,
        expertise: students[0].expertise,
        languages: students[0].languages,
        frameworks: students[0].frameworks,
        work_with: students[0].work_with,
        dont_work_with: students[0].dont_work_with,
      });
    });

    it("generates a composite student from the team", () => {
      const ranker = new StudentRanker();
      expect(ranker.generateCompositeStudent(team)).toStrictEqual(
        compositeStudent
      );
    });
  });

  describe("Equality checking", () => {
    it("returns false for differing value types", () => {
      const ranker = new StudentRanker();
      const date = new Date();

      expect(ranker.isEqual("column", null, undefined)).toBe(false);
      expect(ranker.isEqual("column", undefined, null)).toBe(false);
      expect(ranker.isEqual("column", "string", 0)).toBe(false);
      expect(ranker.isEqual("column", 0, "string")).toBe(false);
      expect(ranker.isEqual("column", true, date)).toBe(false);
      expect(ranker.isEqual("column", date, false)).toBe(false);
    });

    it("returns false for unequal arrays, with order independence", () => {
      const ranker = new StudentRanker();
      const arrA = ["valueA", "valueB"];
      const arrB = ["valueC", "valueD"];
      const arrC = [];

      expect(ranker.isEqual("column", arrA, arrB)).toBe(false);
      expect(ranker.isEqual("column", arrA, arrC)).toBe(false);
    });

    it("returns false for unequal objects, with order independence", () => {
      const ranker = new StudentRanker();
      const objA = {
        a: "valueA",
        b: "valueB",
      };
      const objB = {
        b: "valueD",
        a: "valueC",
      };
      const objC = {};

      expect(ranker.isEqual("column", objA, objB)).toBe(false);
      expect(ranker.isEqual("column", objA, objC)).toBe(false);
    });

    it("returns false for unequal composite major", () => {
      const ranker = new StudentRanker();
      const compositeMajors = ["majorA", "majorB"];
      const studentMajor = "majorA";

      expect(ranker.isEqual("major", compositeMajors, studentMajor)).toBe(
        false
      );
    });

    it("returns true for equal non-object values", () => {
      const ranker = new StudentRanker();
      const date = new Date();

      expect(ranker.isEqual("column", undefined, undefined)).toBe(true);
      expect(ranker.isEqual("column", null, null)).toBe(true);
      expect(ranker.isEqual("column", "string", "string")).toBe(true);
      expect(ranker.isEqual("column", 0, 0)).toBe(true);
      expect(ranker.isEqual("column", true, true)).toBe(true);
      expect(ranker.isEqual("column", date, date)).toBe(true);
    });

    it("returns true for equal arrays, with order independence", () => {
      const ranker = new StudentRanker();
      const arrA = ["valueA", "valueB"];
      const arrB = ["valueB", "valueA"];

      expect(ranker.isEqual("column", arrA, arrB)).toBe(true);
      expect(ranker.isEqual("column", arrB, arrA)).toBe(true);
    });

    it("returns true for equal objects, with order independence", () => {
      const ranker = new StudentRanker();
      const objA = {
        a: "valueA",
        b: "valueB",
      };
      const objB = {
        b: "valueB",
        a: "valueA",
      };

      expect(ranker.isEqual("column", objA, objB)).toBe(true);
      expect(ranker.isEqual("column", objB, objA)).toBe(true);
    });

    it("returns true for equal composite major", () => {
      const ranker = new StudentRanker();
      const compositeMajors = ["majorA"];
      const studentMajor = "majorA";

      expect(ranker.isEqual("major", compositeMajors, studentMajor)).toBe(true);

      // Checks that order dependence is kept (i.e. the composite comes first)
      expect(ranker.isEqual("major", studentMajor, compositeMajors)).toBe(
        false
      );
    });
  });

  describe("Shared checking", () => {
    it("returns false for non-overlapping arrays", () => {
      const ranker = new StudentRanker();
      const arr1 = ["val1", "val2"];
      const arr2 = ["val3", "val4", "val5"];

      expect(ranker.anyShared(arr1, arr2)).toBe(false);
      expect(ranker.anyShared(arr2, arr1)).toBe(false);
    });

    it("returns false for non-overlapping array and value", () => {
      const ranker = new StudentRanker();
      const arr = ["val1", "val2"];
      const val = "val3";

      expect(ranker.anyShared(arr, val)).toBe(false);
      expect(ranker.anyShared(val, arr)).toBe(false);
    });

    it("returns false for unequal values", () => {
      const ranker = new StudentRanker();
      const val1 = "val1";
      const val2 = "val2";

      expect(ranker.anyShared(val1, val2)).toBe(false);
      expect(ranker.anyShared(val2, val1)).toBe(false);
    });

    it("returns true for overlapping arrays", () => {
      const ranker = new StudentRanker();
      const arr1 = ["val1", "val2"];
      const arr2 = ["val2", "val3"];

      expect(ranker.anyShared(arr1, arr2)).toBe(true);
      expect(ranker.anyShared(arr2, arr1)).toBe(true);
    });

    it("returns true for overlapping array and value", () => {
      const ranker = new StudentRanker();
      const arr = ["val1", "val2"];
      const val = "val2";

      expect(ranker.anyShared(arr, val)).toBe(true);
      expect(ranker.anyShared(val, arr)).toBe(true);
    });

    it("returns true for equal values", () => {
      const ranker = new StudentRanker();
      const val1 = "val1";
      const val2 = "val1";

      expect(ranker.anyShared(val1, val2)).toBe(true);
      expect(ranker.anyShared(val2, val1)).toBe(true);
    });
  });

  describe("Proximity checking", () => {
    it("returns false for failed external proximity boundary check", () => {
      const ranker = new StudentRanker();
      const type = "external";
      const difference = 3;
      const valueA = 0;
      const valueB = 2;

      expect(ranker.inProximity(type, difference, valueA, valueB)).toBe(false);
      expect(ranker.inProximity(type, difference, valueB, valueA)).toBe(false);
    });

    it("returns false for failed internal proximity boundary check", () => {
      const ranker = new StudentRanker();
      const type = "internal";
      const difference = 3;
      const valueA = 0;
      const valueB = 4;

      expect(ranker.inProximity(type, difference, valueA, valueB)).toBe(false);
      expect(ranker.inProximity(type, difference, valueB, valueA)).toBe(false);
    });

    it("returns true for passed external proximity boundary check on boundary", () => {
      const ranker = new StudentRanker();
      const type = "external";
      const difference = 3;
      const valueA = 0;
      const valueB = 3;

      expect(ranker.inProximity(type, difference, valueA, valueB)).toBe(true);
      expect(ranker.inProximity(type, difference, valueB, valueA)).toBe(true);
    });

    it("returns true for passed internal proximity boundary check on boundary", () => {
      const ranker = new StudentRanker();
      const type = "internal";
      const difference = 3;
      const valueA = 0;
      const valueB = 3;

      expect(ranker.inProximity(type, difference, valueA, valueB)).toBe(true);
      expect(ranker.inProximity(type, difference, valueB, valueA)).toBe(true);
    });

    it("returns true for passed external proximity boundary check not on boundary", () => {
      const ranker = new StudentRanker();
      const type = "external";
      const difference = 3;
      const valueA = 0;
      const valueB = 10;

      expect(ranker.inProximity(type, difference, valueA, valueB)).toBe(true);
      expect(ranker.inProximity(type, difference, valueB, valueA)).toBe(true);
    });

    it("returns true for passed internal proximity boundary check not on boundary", () => {
      const ranker = new StudentRanker();
      const type = "internal";
      const difference = 3;
      const valueA = 0;
      const valueB = 0;

      expect(ranker.inProximity(type, difference, valueA, valueB)).toBe(true);
      expect(ranker.inProximity(type, difference, valueB, valueA)).toBe(true);
    });
  });

  describe("Name list matching", () => {
    it("returns false for no found overlap", () => {
      const ranker = new StudentRanker();
      const compositeList = ["Name1", "Name2"]; // The collective names mentioned by the composite
      const studentList = ["Name3", "Name4"]; // The names mentioned by the student
      const compositeNames = ["Name1"]; // The student names which comprise the composite
      const studentName = "Name5"; // The student being compared

      expect(
        ranker.nameListMatch(
          compositeList,
          studentList,
          compositeNames,
          studentName
        )
      ).toBe(false);
      expect(ranker.nameListMatch([], [], compositeNames, studentName)).toBe(
        false
      );
    });

    it("returns true for found overlap, composite -> student", () => {
      const ranker = new StudentRanker();
      const compositeList = ["Name1", "Name2"]; // The collective names mentioned by the composite
      const studentList = ["Name3", "Name4"]; // The names mentioned by the student
      const compositeNames = ["Name1"]; // The student names which comprise the composite
      const studentName = "Name2"; // The student being compared

      expect(
        ranker.nameListMatch(
          compositeList,
          studentList,
          compositeNames,
          studentName
        )
      ).toBe(true);
      expect(
        ranker.nameListMatch(compositeList, [], compositeNames, studentName)
      ).toBe(true);
    });

    it("returns true for found overlap, student -> composite", () => {
      const ranker = new StudentRanker();
      const compositeList = ["Name1", "Name2"]; // The collective names mentioned by the composite
      const studentList = ["Name1", "Name4"]; // The names mentioned by the student
      const compositeNames = ["Name1"]; // The student names which comprise the composite
      const studentName = "Name5"; // The student being compared

      expect(
        ranker.nameListMatch(
          compositeList,
          studentList,
          compositeNames,
          studentName
        )
      ).toBe(true);
      expect(
        ranker.nameListMatch([], studentList, compositeNames, studentName)
      ).toBe(true);
    });
  });

  describe("Student comparison", () => {
    it("compares a high priority student", () => {
      const ranker = new StudentRanker();
      const expectedRes = {
        "studentId": 2,
        "weight": 12,
        "flagDetails": [
          {
            "key": "section_id",
            "passedFlags": [],
            "failedFlags": ["not_shared"],
          },
          {
            "key": "major",
            "passedFlags": ["not_shared"],
            "failedFlags": [],
          },
          {
            "key": "leadership",
            "passedFlags": ["proximity"],
            "failedFlags": [],
          },
          {
            "key": "expertise",
            "passedFlags": ["proximity"],
            "failedFlags": [],
          },
          {
            "key": "languages",
            "passedFlags": [],
            "failedFlags": ["shared"],
          },
          {
            "key": "frameworks",
            "passedFlags": ["not_shared"],
            "failedFlags": ["non_null"],
          },
          {
            "key": "work_with",
            "passedFlags": ["work_with"],
            "failedFlags": [],
          },
          {
            "key": "dont_work_with",
            "passedFlags": [],
            "failedFlags": ["dont_work_with"],
          },
        ],
      };

      expect(
        ranker.compareStudent(
          compositeStudent,
          students[2],
          compMap,
          teamedStudents
        )
      ).toStrictEqual(expectedRes);
    });

    it("compares an already teamed student", () => {
      const ranker = new StudentRanker();
      const expectedRes = {
        "studentId": 0,
        "weight": -Infinity,
        "flagDetails": [
          {
            "key": "section_id",
            "passedFlags": [],
            "failedFlags": ["not_shared"],
          },
          {
            "key": "major",
            "passedFlags": [],
            "failedFlags": ["not_shared"],
          },
          {
            "key": "leadership",
            "passedFlags": ["proximity"],
            "failedFlags": [],
          },
          {
            "key": "expertise",
            "passedFlags": ["proximity"],
            "failedFlags": [],
          },
          {
            "key": "languages",
            "passedFlags": ["shared"],
            "failedFlags": [],
          },
          {
            "key": "frameworks",
            "passedFlags": ["non_null"],
            "failedFlags": ["not_shared"],
          },
          {
            "key": "work_with",
            "passedFlags": ["work_with"],
            "failedFlags": [],
          },
          {
            "key": "dont_work_with",
            "passedFlags": [],
            "failedFlags": ["dont_work_with"],
          },
          {
            "key": "student_id",
            "passedFlags": ["not_teamed"],
            "failedFlags": [],
          },
        ],
      };

      expect(
        ranker.compareStudent(
          compositeStudent,
          students[0],
          compMap,
          teamedStudents
        )
      ).toStrictEqual(expectedRes);
    });

    it("compares an incompatible student", () => {
      const ranker = new StudentRanker();
      const expectedRes = {
        "studentId": 3,
        "weight": -Infinity,
        "flagDetails": [
          {
            "key": "section_id",
            "passedFlags": [],
            "failedFlags": ["not_shared"],
          },
          {
            "key": "major",
            "passedFlags": ["not_shared"],
            "failedFlags": [],
          },
          {
            "key": "leadership",
            "passedFlags": ["proximity"],
            "failedFlags": [],
          },
          {
            "key": "expertise",
            "passedFlags": ["proximity"],
            "failedFlags": [],
          },
          {
            "key": "languages",
            "passedFlags": [],
            "failedFlags": ["shared"],
          },
          {
            "key": "frameworks",
            "passedFlags": ["not_shared"],
            "failedFlags": ["non_null"],
          },
          {
            "key": "work_with",
            "passedFlags": ["work_with"],
            "failedFlags": [],
          },
          {
            "key": "dont_work_with",
            "passedFlags": ["dont_work_with"],
            "failedFlags": [],
          },
        ],
      };

      expect(
        ranker.compareStudent(
          compositeStudent,
          students[3],
          compMap,
          teamedStudents
        )
      ).toStrictEqual(expectedRes);
    });
  });

  describe("Suggestion generation", () => {
    it("returns an empty list", () => {
      const ranker = new StudentRanker();
      expect(
        ranker.generateSuggestions([], new Set(), students, compMap)
      ).toStrictEqual([]);
    });

    it("returns a list of students ranked in comparison to the team, sorted in descending weighted order", () => {
      const ranker = new StudentRanker();
      expect(
        ranker.generateSuggestions(team, teamedStudents, students, compMap)
      ).toStrictEqual(comparisonResults);
    });
  });
});

"use server";

import {
  formAction,
  handleResponse,
  HTTPMethod,
  serverAction,
} from "@/lib/utils";
import { api } from "@/lib/utils.server";
import z from "zod";
import { readCSVFile } from "./csv";

async function _getStudent(
  courseId: number,
  sectionId: number,
  studentId: number
) {
  const response = await api(
    `/course/${courseId}/section/${sectionId}/student/${studentId}`,
    HTTPMethod.GET
  );

  if (response.status === 200) {
    return (await response.json()) as IStudent;
  } else {
    throw new Error("An unexpected error occurred");
  }
}

const studentsBatchCreateSchema = z.object({
  file: z
    .file()
    .mime(["text/csv", "application/vnd.ms-excel"], "File must be a CSV file"),
  first_name: z.string("Please select a field").min(1, "Please select a field"),
  last_name: z.string().optional(),
  email: z.string("Please select a field").min(1, "Please select a field"),
  major: z.string("Please select a field").min(1, "Please select a field"),
  sectionId: z.preprocess((val: string) => Number(val), z.number()),
  courseId: z.preprocess((val: string) => Number(val), z.number()),
});

async function _createStudentsBatch(
  data: z.output<typeof studentsBatchCreateSchema>
) {
  // Dynamic schema to validate CSV data based on the user's selections
  const dataSchema = z.object({
    [data.first_name]: z.string().min(1, "Each student must have a name"),
    ...(data.last_name ? { [data.last_name]: z.string() } : {}),
    [data.email]: z.email("Invalid email address"),
    [data.major]: z.string().optional(),
  });

  const csvData = await readCSVFile(data.file);
  const uploadData: Record<string, string | undefined>[] = [];

  for (const stu of csvData) {
    const { data: parsedData, error } = dataSchema.safeParse(stu);
    if (error) {
      console.error(error);
      throw new Error("Invalid CSV data");
    }
    uploadData.push({
      name: data.last_name
        ? `${parsedData[data.first_name]} ${parsedData[data.last_name]}`
        : parsedData[data.first_name],
      email: parsedData[data.email],
      major: parsedData[data.major],
    });
  }

  const response = await api(
    `/course/${data.courseId}/section/${data.sectionId}/student`,
    HTTPMethod.POST,
    uploadData
  );

  return handleResponse<IStudent[]>("_createStudentsBatch", response);
}

const studentsBatchUpdateSchema = z.object({
  file: z
    .file()
    .mime(["text/csv", "application/vnd.ms-excel"], "File must be a CSV file"),
  email: z.string("Please select a field").min(1, "Please select a field"),
  expertise: z.string().optional(),
  leadership: z.string().optional(),
  languages: z.string().optional(),
  frameworks: z.string().optional(),
  workWith: z.string().optional(),
  dontWorkWith: z.string().optional(),
  courseId: z.preprocess((val) => Number(val), z.number()),
  sectionId: z.preprocess((val) => Number(val), z.number()),
});

function toStringArray(value: string | number | undefined) {
  if (!value || typeof value === "number") return [];
  return value.split(",").map((v) => v.trim());
}

// Utility types and functions to help with
// declaring dynamic Zod schemas
const optionalString = z.string().optional();

const optionalNumRange = (min: number, max: number, msg: string) =>
  z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.optional(z.number(msg).min(min, msg).max(max, msg))
  );

/**
 * Create an object that can be spread into the larger schema which includes
 * the key from the CSV data to access for each field
 *
 * @param key The key from submitted data, a string or undefined
 * @param schema What Zod type should this data be
 * @returns An object to be spread into the larger schema, or undefined
 */
const dynamicField = <T extends z.ZodType>(
  key: string | undefined,
  schema: T
) => (key ? { [key]: schema } : undefined);

async function _updateStudentsBatch(
  data: z.output<typeof studentsBatchUpdateSchema>
) {
  const dataSchema = z.object({
    [data.email]: z.email("Invalid email address found"),
    ...dynamicField(
      data.expertise,
      optionalNumRange(1, 10, "Expertise must be a number between 1 and 10")
    ),
    ...dynamicField(
      data.leadership,
      optionalNumRange(1, 10, "Expertise must be a number between 1 and 10")
    ),
    ...dynamicField(data.languages, optionalString),
    ...dynamicField(data.frameworks, optionalString),
    ...dynamicField(data.workWith, optionalString),
    ...dynamicField(data.dontWorkWith, optionalString),
  });

  const csvData = await readCSVFile(data.file);
  const patchData: Record<string, string | string[] | number | undefined>[] =
    [];

  for (const row of csvData) {
    const { data: parsedData, error } = dataSchema.safeParse(row);
    if (error) {
      throw new Error(Object.values(z.flattenError(error).fieldErrors)[0]?.[0]);
    }

    patchData.push({
      email: parsedData[data.email],
      ...(data.leadership && parsedData[data.leadership]
        ? { leadership: parsedData[data.leadership] }
        : {}),
      ...(data.expertise && parsedData[data.expertise]
        ? { expertise: parsedData[data.expertise] }
        : {}),
      languages: data.languages
        ? toStringArray(parsedData[data.languages])
        : undefined,
      frameworks: data.frameworks
        ? toStringArray(parsedData[data.frameworks])
        : undefined,
      work_with: data.workWith
        ? toStringArray(parsedData[data.workWith])
        : undefined,
      dont_work_with: data.dontWorkWith
        ? toStringArray(parsedData[data.dontWorkWith])
        : undefined,
    });
  }

  const response = await api(
    `/course/${data.courseId}/section/${data.sectionId}/student`,
    HTTPMethod.PATCH,
    patchData
  );

  if (response.status === 400) {
    throw new Error("Some data was entered wrong");
  } else if (response.status === 401) {
    throw new Error("Unauthorized");
  } else if (response.status === 409) {
    throw new Error(
      "At least one student you are trying to create already exists"
    );
  } else if (response.status === 500) {
    throw new Error("Something is wrong with our servers");
  }
}

const studentCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email(),
  major: z.string().min(1, "Major is required"),
  courseId: z.preprocess((val: string) => Number(val), z.number()),
  sectionId: z.preprocess((val: string) => Number(val), z.number()),
});

async function _createStudent(data: z.output<typeof studentCreateSchema>) {
  const response = await api(
    `/course/${data.courseId}/section/${data.sectionId}/student`,
    HTTPMethod.POST,
    [data]
  );

  return handleResponse<IStudent>("_createStudent", response);
}

const studentUpdateSchema = z.object({
  studentId: z.preprocess((val: string) => Number(val), z.number()),
  courseId: z.preprocess((val: string) => Number(val), z.number()),
  sectionId: z.preprocess((val: string) => Number(val), z.number()),
  name: z.string().min(1, "Name is required"),
  email: z.email(),
  major: z.string().min(1, "Major is required"),
  leadership: z.preprocess(
    (val: string | null) => {
      if (!val || val.trim() === "") {
        return undefined;
      } else {
        return Number(val);
      }
    },
    z.optional(z.number().min(1).max(10))
  ),
  expertise: z.preprocess(
    (val: string | null) => {
      if (!val || val.trim() === "") {
        return undefined;
      } else {
        return Number(val);
      }
    },
    z.optional(z.number().min(1).max(10))
  ),
  languages: z
    .string()
    .refine((val) => /(\S,?)*/.test(val), {
      error: "Must be a comma-separated list of languages",
    })
    .optional()
    .transform((val: string | undefined) => {
      if (val) {
        return val.split(/,\s*/g);
      } else {
        return [];
      }
    }),
  frameworks: z
    .string()
    .refine((val) => /(\S(,\s*)?)*/.test(val), {
      error: "Must be a comma-separated list of languages",
    })
    .optional()
    .transform((val: string | undefined) => {
      if (val) {
        return val.split(/,\s*/g);
      } else {
        return [];
      }
    }),
  work_with: z
    .string()
    .refine((val) => /(\S(,\s*)?)*/.test(val), {
      error: "Must be a comma-separated list of student names",
    })
    .optional()
    .transform((val: string | undefined) => {
      if (val) {
        return val.split(/,\s*/g);
      } else {
        return [];
      }
    }),
  dont_work_with: z
    .string()
    .refine((val) => /(\S(,\s*)?)*/.test(val), {
      error: "Must be a comma-separated list of student names",
    })
    .optional()
    .transform((val: string | undefined) => {
      if (val) {
        return val.split(/,\s*/g);
      } else {
        return [];
      }
    }),
});

async function _updateStudent(data: z.output<typeof studentUpdateSchema>) {
  const response = await api(
    `/course/${data.courseId}/section/${data.sectionId}/student/${data.studentId}`,
    HTTPMethod.PATCH,
    data
  );

  return handleResponse<IStudent>("_updateStudent", response);
}

async function _moveStudent(
  courseId: number,
  sectionId: number,
  studentId: number,
  teamId: number | null
) {
  const response = await api(
    `/course/${courseId}/section/${sectionId}/student/${studentId}`,
    HTTPMethod.PATCH,
    {
      team_id: teamId,
    }
  );
  if (!response.ok) {
    console.error(`[_moveStudent] (${response.status})`);
    throw new Error("An unexpected error occurred");
  }
}

export interface MoveStudentObj {
  sectionId: number;
  studentId: number;
  teamId: number;
}

async function _batchMoveStudents(courseId: number, moves: MoveStudentObj[]) {
  const response = await api(
    `/course/${courseId}/section/move_students`,
    HTTPMethod.PATCH,
    {
      moves: moves,
    }
  );

  return handleResponse<boolean>("_batchMoveStudents", response);
}

async function _deleteStudent(
  courseId: number,
  sectionId: number,
  studentId: number
) {
  const response = await api(
    `/course/${courseId}/section/${sectionId}/student/${studentId}`,
    HTTPMethod.DELETE
  );

  return handleResponse<boolean>("_deleteStudent", response, undefined, {
    204: () => true,
  });
}

export const getStudent = serverAction(_getStudent);
export const createStudents = formAction(
  studentsBatchCreateSchema,
  _createStudentsBatch
);
export const createStudent = formAction(studentCreateSchema, _createStudent);
export const updateStudent = formAction(studentUpdateSchema, _updateStudent);
export const deleteStudent = serverAction(_deleteStudent);
export const moveStudent = serverAction(_moveStudent);
export const batchMoveStudents = serverAction(_batchMoveStudents);
export const updateStudents = formAction(
  studentsBatchUpdateSchema,
  _updateStudentsBatch
);

"use server";

import {
  formAction,
  handleResponse,
  HTTPMethod,
  serverAction,
} from "@/lib/utils";
import { api } from "@/lib/utils.server";
import z from "zod";

const courseCreateSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  code: z.string().optional(),
  term: z.string().optional(),
});

async function _createCourse(data: z.output<typeof courseCreateSchema>) {
  const response = await api(`/course`, HTTPMethod.POST, data);

  return handleResponse<ICourse>("_createCourse", response);
}

const courseUpdateSchema = courseCreateSchema.extend({
  courseId: z.preprocess((val: string) => Number(val), z.number()),
});

async function _updateCourse(data: z.output<typeof courseUpdateSchema>) {
  const response = await api(
    `/course/${data.courseId}`,
    HTTPMethod.PATCH,
    data
  );

  return handleResponse<ICourse>("_updateCourse", response);
}

async function _deleteCourse(courseId: number) {
  const response = await api(`/course/${courseId}`, HTTPMethod.DELETE);

  return handleResponse<boolean>("_deleteCourse", response, undefined, {
    204: () => true,
  });
}

async function _getCourse(courseId: number) {
  const response = await api(`/course/${courseId}`, HTTPMethod.GET);

  return handleResponse<ICourse | null>("_getCourse", response, undefined, {
    404: () => null,
  });
}

async function _getAllCourses() {
  const response = await api(`/course`, HTTPMethod.GET);

  return handleResponse<ICourse[]>("_getAllCourses", response);
}

export const createCourse = formAction(courseCreateSchema, _createCourse);
export const updateCourse = formAction(courseUpdateSchema, _updateCourse);
export const deleteCourse = serverAction(_deleteCourse);
export const getCourse = serverAction(_getCourse);
export const getAllCourses = serverAction(_getAllCourses);

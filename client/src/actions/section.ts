"use server";

import {
  formAction,
  handleResponse,
  HTTPMethod,
  serverAction,
} from "@/lib/utils";
import { api } from "@/lib/utils.server";
import z from "zod";

const sectionCreateSchema = z.object({
  name: z.string().min(1, "A name is required"),
  courseId: z.preprocess((val: string) => Number(val), z.number()),
});

async function _createSection(data: z.output<typeof sectionCreateSchema>) {
  const createData = { ...data, courseId: undefined };

  const response = await api(
    `/course/${data.courseId}/section`,
    HTTPMethod.POST,
    createData
  );

  return handleResponse<ISection>("_createSection", response);
}

const sectionUpdateSchema = sectionCreateSchema.extend({
  sectionId: z.preprocess((val: string) => Number(val), z.number()),
});

async function _updateSection(data: z.output<typeof sectionUpdateSchema>) {
  const updateData = { ...data, courseId: undefined, sectionId: undefined };

  const response = await api(
    `/course/${data.courseId}/section/${data.sectionId}`,
    HTTPMethod.PATCH,
    updateData
  );

  return handleResponse("_updateSection", response);
}

async function _deleteSection(courseId: number, sectionId: number) {
  const response = await api(
    `/course/${courseId}/section/${sectionId}`,
    HTTPMethod.DELETE
  );

  return handleResponse<boolean>("_deleteSection", response, undefined, {
    204: () => true,
  });
}

async function _getSection(courseId: number, sectionId: number) {
  const response = await api(
    `/course/${courseId}/section/${sectionId}`,
    HTTPMethod.GET
  );

  return handleResponse<ISection | null>("_getSection", response, undefined, {
    404: () => null,
  });
}

async function _getAllSections(courseId: number) {
  const response = await api(`/course/${courseId}/section`, HTTPMethod.GET);

  return handleResponse<ISection[]>("_getAllSections", response);
}

export const createSection = formAction(sectionCreateSchema, _createSection);
export const updateSection = formAction(sectionUpdateSchema, _updateSection);
export const deleteSection = serverAction(_deleteSection);
export const getSection = serverAction(_getSection);
export const getAllSections = serverAction(_getAllSections);

"use server";

import {
  formAction,
  handleResponse,
  HTTPMethod,
  serverAction,
} from "@/lib/utils";
import { api } from "@/lib/utils.server";
import z from "zod";

const labelCreateSchema = z.object({
  name: z.string().min(1, "A name is required"),
  color: z.string(),
});

async function _createLabel(data: z.output<typeof labelCreateSchema>) {
  const response = await api(`/label`, HTTPMethod.POST, data);

  return handleResponse("_createLabel", response);
}

const labelUpdateSchema = labelCreateSchema.extend({
  labelId: z.preprocess((val: string) => Number(val), z.number()),
});

async function _updateLabel(data: z.output<typeof labelUpdateSchema>) {
  const updateData = { ...data, labelId: undefined };

  const response = await api(
    `/label/${data.labelId}`,
    HTTPMethod.PATCH,
    updateData
  );

  return handleResponse<ILabel>("_updateLabel", response);
}

async function _deleteLabel(labelId: number) {
  const response = await api(`/label/${labelId}`, HTTPMethod.DELETE);

  return handleResponse<boolean>("_deleteLabel", response, undefined, {
    204: () => true,
  });
}

async function _getAllLabels() {
  const response = await api(`/label`, HTTPMethod.GET);

  return handleResponse<ILabel[]>("_getAllLabels", response);
}

async function _assignLabels(
  labelIds: number[],
  teamId?: number,
  studentId?: number
) {
  if (!teamId && !studentId)
    throw new Error("Must provide a team or student id");

  const response = await api(`/label/assign`, HTTPMethod.POST, {
    labelIds: labelIds,
    teamId: teamId,
    studentId: studentId,
  });

  if (response.ok) {
    return true;
  } else {
    console.error(`[_assignLabel] (${response.status})`);
    throw new Error("An unexpected error occurred.");
  }
}

export const createLabel = formAction(labelCreateSchema, _createLabel);
export const updateLabel = formAction(labelUpdateSchema, _updateLabel);
export const deleteLabel = serverAction(_deleteLabel);
export const getAllLabels = serverAction(_getAllLabels);
export const assignLabels = serverAction(_assignLabels);

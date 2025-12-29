"use server";

import {
  formAction,
  handleResponse,
  HTTPMethod,
  serverAction,
} from "@/lib/utils";
import { api } from "@/lib/utils.server";
import z from "zod";

const teamCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  courseId: z.preprocess((val) => Number(val), z.number()),
});

async function _createTeam(data: z.output<typeof teamCreateSchema>) {
  const response = await api(`/course/${data.courseId}/team`, HTTPMethod.POST, {
    name: data.name,
  });

  return handleResponse<ITeam>("_createTeam", response, undefined, {
    409: () => {
      throw new Error("A team already exists with this name");
    },
  });
}

const batchTeamCreateSchema = z.object({
  courseId: z.preprocess((val) => Number(val), z.number()),
  teamCount: z.preprocess((val) => Number(val), z.number()),
  prefix: z.string().optional(),
});

async function _batchCreateTeams(data: z.output<typeof batchTeamCreateSchema>) {
  const response = await api(
    `/course/${data.courseId}/team/bulk_create`,
    HTTPMethod.POST,
    {
      prefix: data.prefix,
      teamCount: data.teamCount,
    }
  );

  return handleResponse<ITeam>("_createTeam", response);
}

const teamUpdateSchema = teamCreateSchema.extend({
  teamId: z.preprocess((val) => Number(val), z.number()),
});

async function _updateTeam(data: z.output<typeof teamUpdateSchema>) {
  const response = await api(
    `/course/${data.courseId}/team/${data.teamId}`,
    HTTPMethod.PATCH,
    {
      name: data.name,
    }
  );

  return handleResponse<ITeam>("_updateTeam", response, undefined, {
    409: () => {
      throw new Error("A team already exists with this name");
    },
  });
}

async function _deleteTeam(courseId: number, teamId: number) {
  const response = await api(
    `/course/${courseId}/team/${teamId}`,
    HTTPMethod.DELETE
  );

  return handleResponse<boolean>("_deleteTeam", response, undefined, {
    204: () => true,
  });
}

async function _batchDeleteTeams(courseId: number) {
  const response = await api(
    `/course/${courseId}/team/bulk_delete`,
    HTTPMethod.DELETE
  );

  return handleResponse<boolean>("_batchDeleteTeams", response, undefined, {
    204: () => true,
  });
}

async function _getAllTeams(courseId: number) {
  const response = await api(`/course/${courseId}/team`, HTTPMethod.GET);

  if (response.ok) {
    return (await response.json()) as ITeam[];
  }

  console.error(`[_getAllTeams] (${response.status})`);
  throw new Error("An unexpected error occurred");
}

export const createTeam = formAction(teamCreateSchema, _createTeam);
export const updateTeam = formAction(teamUpdateSchema, _updateTeam);
export const deleteTeam = serverAction(_deleteTeam);
export const batchDeleteTeams = serverAction(_batchDeleteTeams);
export const getAllTeams = serverAction(_getAllTeams);
export const batchCreateTeams = formAction(
  batchTeamCreateSchema,
  _batchCreateTeams
);

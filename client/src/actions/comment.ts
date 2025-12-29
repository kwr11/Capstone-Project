"use server";

import {
  formAction,
  handleResponse,
  HTTPMethod,
  serverAction,
} from "@/lib/utils";
import { api } from "@/lib/utils.server";
import z from "zod";

const commentCreateSchema = z.object({
  content: z.string().trim().min(1, "Please enter a comment"),
  studentId: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.optional(z.number())
  ),
  teamId: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.optional(z.number())
  ),
});

async function _createComment(data: z.output<typeof commentCreateSchema>) {
  if (!data.studentId && !data.teamId)
    throw new Error("studentId or teamId is required");

  const URL = data.studentId
    ? `/student/${data.studentId}/comment`
    : `/team/${data.teamId}/comment`;

  const response = await api(URL, HTTPMethod.POST, data);

  return handleResponse<IComment>("_createComment", response);
}

const commentUpdateSchema = z.object({
  content: z.string().trim().min(1, "Please enter a comment"),
  commentId: z.preprocess((val) => Number(val), z.number()),
});

async function _updateComment(data: z.output<typeof commentUpdateSchema>) {
  const response = await api(
    `/comment/${data.commentId}`,
    HTTPMethod.PATCH,
    data
  );

  return handleResponse<IComment>("_updateComment", response);
}

async function _deleteComment(commentId: number) {
  const response = await api(`/comment/${commentId}`, HTTPMethod.DELETE);

  return handleResponse<boolean>("_deleteComment", response, undefined, {
    204: () => true,
  });
}

export const createComment = formAction(commentCreateSchema, _createComment);
export const updateComment = formAction(commentUpdateSchema, _updateComment);
export const deleteComment = serverAction(_deleteComment);

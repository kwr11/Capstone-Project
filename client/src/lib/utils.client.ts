"use client";

import { ErrorResult, SuccessResult } from "./utils";

export async function doServerAction<T>(
  promise: Promise<SuccessResult<T> | ErrorResult>
): Promise<SuccessResult<T> | ErrorResult> {
  try {
    return await promise;
  } catch (e) {
    console.log(e);
    return [
      null,
      {
        cause: e as Error,
        message: "There is a problem with our servers",
      },
    ];
  }
}

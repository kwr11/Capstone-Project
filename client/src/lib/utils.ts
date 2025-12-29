import { clsx, type ClassValue } from "clsx";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { twMerge } from "tailwind-merge";
import z, { safeParse } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export enum HTTPMethod {
  GET = "get",
  POST = "post",
  PATCH = "patch",
  DELETE = "delete",
}

/**
 * Utility function to deal with responses from the server in a uniform manner and avoid repeating code.
 *
 * @param label - Preferably the name of the calling function, or some label that can identify it
 * @param response - The response received from the FETCH call
 * @param successCallback - An optional callback to run if the FETCH succeeds. Receives the parsed JSON data
 * @param codeOverrides - An optional map of status codes to custom responses
 * @returns The parsed JSON data
 */
export async function handleResponse<TData>(
  label: string,
  response: Response,
  successCallback?: (data: TData) => unknown,
  codeOverrides?: Record<number, () => TData>
) {
  if (codeOverrides && codeOverrides[response.status]) {
    return codeOverrides[response.status]();
  }

  if (response.ok) {
    const data = (await response.json()) as TData;

    if (successCallback) {
      await successCallback(data);
    }

    return data;
  }

  console.error(
    `[${label}] (${response.status}) @ ${new Date().toLocaleTimeString(
      "en-US",
      {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    )}`
  );

  switch (response.status) {
    case 401:
      throw new Error("You are not logged in");
    case 403:
      throw new Error("You cannot do this");
    case 404:
      throw new Error("This resource could not be found");
    case 409:
      throw new Error("This data conflicts with existing data");
    case 418:
    case 500:
      throw new Error("There is something wrong with our servers");
    default:
      throw new Error("An unexpected error occurred");
  }
}

export function serverAction<T, TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<T>
) {
  return (...args: TArgs) => tryCatch(fn(...args));
}

export function parseSchema<T extends z.ZodObject>(
  schema: T,
  formData: FormData
) {
  const dataObject = Object.fromEntries(formData.entries()) as z.input<T>;
  const { data, error } = safeParse(schema, dataObject);
  if (error) throw new Error(z.treeifyError(error).errors.join(","));
  return data;
}

export type ErrorResult = readonly [
  null,
  {
    message: string;
    cause: Error;
  },
];
export type SuccessResult<T> = readonly [T, null];

export async function tryCatch<T>(
  promise: Promise<T>
): Promise<SuccessResult<T> | ErrorResult> {
  try {
    const result = await promise;
    return [result, null];
  } catch (e) {
    console.error(e);

    if (isRedirectError(e)) {
      throw e;
    }

    if (
      e &&
      typeof e === "object" &&
      "message" in e &&
      typeof e.message === "string"
    ) {
      return [
        null,
        {
          message: e.message,
          cause: e instanceof Error ? e : new Error("An error occurred"),
        },
      ];
    }

    return [
      null,
      {
        message: "An error occurred",
        cause: new Error("An error occurred"),
      },
    ];
  }
}

type FormErrorResult<TSchema extends z.ZodObject> = {
  success: false;
  data?: never;
  fields?: z.input<TSchema>;
  fieldErrors?: z.core.$ZodFlattenedError<z.infer<TSchema>>["fieldErrors"];
  error?: {
    message: string;
    cause: Error;
  };
};

type FormSuccessResult<TSchema extends z.ZodObject, TData> = {
  success: true;
  data: TData;
  fields?: z.input<TSchema>;
  fieldErrors?: never;
  error?: never;
};

type FormActionFn<TSchema extends z.ZodObject, TData> = (
  data: z.output<TSchema>
) => Promise<TData>;
type FormActionHandler<TSchema extends z.ZodObject, TData> = (
  _: unknown,
  formData: FormData
) => Promise<FormErrorResult<TSchema> | FormSuccessResult<TSchema, TData>>;

export function formAction<TSchema extends z.ZodObject, TData>(
  schema: TSchema,
  fn: FormActionFn<TSchema, TData>
): FormActionHandler<TSchema, TData> {
  return async (_: unknown, formData: FormData) => {
    const fields = Object.fromEntries(formData.entries()) as z.input<TSchema>;

    try {
      const { data, error } = safeParse(schema, fields);
      if (error) {
        return {
          success: false,
          fieldErrors: z.flattenError(error).fieldErrors,
          fields,
        };
      }

      const result = await fn(data);

      return {
        success: true,
        data: result,
        fields,
      };
    } catch (e) {
      if (isRedirectError(e)) {
        throw e;
      }

      console.error(e);

      let message: string | null = null;

      // Get the "message" property of the Error, type-safe
      if (
        e &&
        typeof e === "object" &&
        "message" in e &&
        typeof e["message"] === "string"
      ) {
        message = e["message"];
      }

      return {
        success: false,
        fields,
        error: {
          message: message || "An error occurred.",
          cause: e instanceof Error ? e : new Error("An error occurred"),
        },
      };
    }
  };
}

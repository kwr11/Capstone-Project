"use client";

import { createComment } from "@/actions/comment";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { FormField } from "../form-field";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type StudentCommentFormProps = React.ComponentProps<"form"> &
  (
    | {
        studentId?: number;
        teamId?: never;
      }
    | {
        teamId?: number;
        studentId?: never;
      }
  );

export function AddCommentForm({
  studentId,
  teamId,
  className,
  ...props
}: StudentCommentFormProps) {
  const [formState, formAction, isFormPending] = useActionState(
    createComment,
    null
  );
  const router = useRouter();

  useEffect(() => {
    if (formState?.success) {
      router.refresh();
    }
  }, [formState]);

  return (
    <form
      action={formAction}
      className={cn("grid gap-2", className)}
      {...props}
    >
      <FormField name="content" errors={formState?.fieldErrors?.content}>
        <Textarea
          name="content"
          placeholder="_something_ **interesting**"
          id="content"
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === "Enter") {
              e.currentTarget.form?.requestSubmit();
            }
          }}
          className="field-sizing-content min-h-1lh max-h-[15lh] w-full"
        />
      </FormField>
      {studentId && <input type="hidden" name="studentId" value={studentId} />}
      {teamId && <input type="hidden" name="teamId" value={teamId} />}
      {formState?.error && (
        <p className="text-destructive">{formState.error.message}</p>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="submit" disabled={isFormPending}>
            {isFormPending ? "Adding..." : "Add comment"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-foreground">
            Or{" "}
            <kbd className="p-1 mx-0.5 rounded-md bg-card border border-border shadow-xs">
              Ctrl
            </kbd>{" "}
            +{" "}
            <kbd className="p-1 mx-0.5 rounded-md bg-card border border-border shadow-xs">
              Enter
            </kbd>
          </p>
        </TooltipContent>
      </Tooltip>
    </form>
  );
}

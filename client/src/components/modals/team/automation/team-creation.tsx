"use client";

import { FormField } from "@/components/form-field";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { Dispatch, SetStateAction, useActionState, useEffect } from "react";

import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Stages } from "./action-selector";
import { batchCreateTeams } from "@/actions/team";
import { Button } from "@/components/ui/button";

interface CreateTeamsProps {
  courseId: ICourse["id"];
  router: AppRouterInstance;
  setState: Dispatch<SetStateAction<Stages>>;
}

export function CreateTeamsForm({
  courseId,
  router,
  setState,
}: CreateTeamsProps) {
  const [formState, formAction, isFormPending] = useActionState(
    batchCreateTeams,
    null
  );

  useEffect(() => {
    if (formState?.success) {
      setState(Stages.SELECT_ACTION);
      router.refresh();
    }
  }, [formState, router, setState]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Teams</DialogTitle>
      </DialogHeader>
      <DialogDescription>
        Create the specified number of teams, with an optional naming prefix
      </DialogDescription>
      <form action={formAction}>
        <div className="grid gap-4">
          <FormField
            name="teamCount"
            errors={formState?.fieldErrors?.teamCount}
          >
            <FormField.Label>Number of teams</FormField.Label>
            <FormField.Input
              type="number"
              min={0}
              max={100}
              defaultValue={Number(formState?.fields?.teamCount) || 0}
            />
          </FormField>
          <FormField name="prefix" errors={formState?.fieldErrors?.prefix}>
            <FormField.Label>Team name prefix</FormField.Label>
            <FormField.Input
              type="text"
              placeholder="Team "
              defaultValue={formState?.fields?.prefix}
            />
          </FormField>
          <input type="hidden" name="courseId" value={courseId} />
          {formState?.error && (
            <p className="text-destructive">{formState.error.message}</p>
          )}
        </div>
        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setState(Stages.SELECT_ACTION)}
          >
            Back
          </Button>
          <Button type="submit" disabled={isFormPending}>
            {!isFormPending ? "Create" : "Creating..."}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

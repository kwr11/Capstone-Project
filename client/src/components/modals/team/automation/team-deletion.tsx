"use client";

import { batchDeleteTeams } from "@/actions/team";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { doServerAction } from "@/lib/utils.client";

import { Dispatch, SetStateAction, useState } from "react";

import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Stages } from "./action-selector";

interface DeleteTeamsProps {
  courseId: ICourse["id"];
  courseName: string;
  router: AppRouterInstance;
  setState: Dispatch<SetStateAction<Stages>>;
}

export function DeleteTeamsForm({
  courseId,
  courseName,
  router,
  setState,
}: DeleteTeamsProps) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  const handleDelete = async () => {
    setIsProcessing(true);

    const [, err] = await doServerAction(batchDeleteTeams(courseId));

    setIsProcessing(false);

    if (err) {
      router.refresh();
      setError(err.message);
      return;
    }

    router.refresh();
    setState(Stages.SELECT_ACTION);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Delete Teams</DialogTitle>
      </DialogHeader>
      <DialogDescription>
        If you delete all teams, they will be gone permanently.
      </DialogDescription>
      <div>
        <p>
          Are you sure you want to delete ALL teams for{" "}
          <strong>{courseName}</strong>?
        </p>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>
      <DialogFooter className="mt-4">
        <Button
          variant="outline"
          onClick={() => setState(Stages.SELECT_ACTION)}
        >
          Back
        </Button>
        <Button
          variant={"destructive"}
          onClick={handleDelete}
          disabled={isProcessing}
        >
          {isProcessing ? "Deleting..." : `Delete Teams`}
        </Button>
      </DialogFooter>
    </>
  );
}

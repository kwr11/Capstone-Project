"use client";

import { Dispatch, SetStateAction } from "react";

import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export enum Stages {
  SELECT_ACTION,
  CREATE_TEAMS,
  SEED_TEAMS,
  DELETE_TEAMS,
  POPULATE_TEAMS,
}

interface ActionSelectorProps {
  setState: Dispatch<SetStateAction<Stages>>;
}

export function ActionSelector({ setState }: ActionSelectorProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Select Action</DialogTitle>
        <DialogDescription>Select a team automation action</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => setState(Stages.CREATE_TEAMS)}>
          Create Teams
        </Button>
        <Button onClick={() => setState(Stages.SEED_TEAMS)}>Seed Teams</Button>
        <Button onClick={() => setState(Stages.POPULATE_TEAMS)}>
          Populate Teams
        </Button>
        <Button onClick={() => setState(Stages.DELETE_TEAMS)}>
          Delete Teams
        </Button>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
}

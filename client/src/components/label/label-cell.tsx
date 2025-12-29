"use client";

import { cn } from "@/lib/utils";
import { CheckIcon, PlusIcon } from "lucide-react";
import { useContext, useState } from "react";
import { toast } from "sonner";
import { FALAFELLabel } from ".";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Spinner } from "../ui/spinner";
import { LabelContext } from "./label-provider";

export default function LabelCell({
  classname,
  id,
  labels,
  type,
}: {
  classname?: string;
  id: number;
  labels: ILabel[];
  type: "student" | "team";
}) {
  const ctx = useContext(LabelContext);

  if (!ctx) {
    throw new Error("LabelCell must be used within a LabelProvider component");
  }

  const [currentLabels, setCurrentLabels] = useState<ILabel[]>(labels || []);
  const [loadingLabels, setLoadingLabels] = useState<number[]>([]);

  const refreshLabels = async (labels: ILabel[], opType: string) => {
    const [res] = await ctx.assigner(
      labels.map((l) => l.id),
      type === "team" ? id : undefined,
      type === "student" ? id : undefined
    );

    setLoadingLabels([]);

    if (!res) {
      toast.error(`Failed to ${opType} label. Try refreshing the page.`);
    } else {
      toast.success(
        `Label successfully ${
          opType === "add" ? "added" : "removed"
        }. You may need to refresh the page to see changes.`
      );
      setCurrentLabels(labels);
    }
  };

  const handleLabel = (label: ILabel) => {
    setLoadingLabels([...loadingLabels, label.id]);

    if (currentLabels.some((l) => label.id === l.id)) {
      const newLabels = currentLabels.filter((l) => l.id !== label.id);
      refreshLabels(newLabels, "remove");
    } else {
      const newLabels = [...currentLabels, label];
      refreshLabels(newLabels, "add");
    }
  };

  return (
    <div
      className={cn("flex flex-wrap gap-2 items-center max-w-100", classname)}
    >
      {currentLabels.map((label, i) => (
        <FALAFELLabel
          key={`student-label-${i}`}
          name={label.name}
          color={label.color}
        />
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-sm" variant="outline">
            <PlusIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-card">
          {ctx.labels.length === 0 && (
            <DropdownMenuItem disabled>No Labels</DropdownMenuItem>
          )}
          {ctx.labels.map((label) => {
            return (
              <DropdownMenuItem
                key={`drop-label-${label.id}`}
                className="py-1"
                onSelect={(e) => {
                  e.preventDefault();
                  handleLabel(label);
                }}
              >
                {loadingLabels.includes(label.id) ? (
                  <Spinner />
                ) : (
                  <CheckIcon
                    className={cn(
                      !currentLabels.some((l) => label.id === l.id) &&
                        "opacity-0"
                    )}
                  />
                )}
                <FALAFELLabel
                  classname="m-0"
                  color={label.color}
                  name={label.name}
                />
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

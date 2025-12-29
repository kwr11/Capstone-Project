"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronRight } from "lucide-react";

import { Dispatch, SetStateAction, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface EntitySelectorProps extends React.PropsWithChildren {
  name: string;
  entities: ISection[] | ITeam[];
  selectedEntities: number[];
  setSelectedEntities: Dispatch<SetStateAction<number[]>>;
}

export function EntitySelector({
  children,
  name,
  entities,
  selectedEntities,
  setSelectedEntities,
}: EntitySelectorProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <DropdownMenu onOpenChange={() => setIsExpanded(!isExpanded)}>
      <div className="flex gap-3">
        <Label>{children}</Label>
        <DropdownMenuTrigger asChild>
          <Button className="w-30" variant="outline">
            {name}
            <ChevronRight
              className={cn(
                "cursor-pointer transition-transform",
                isExpanded && "rotate-90"
              )}
            />
          </Button>
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent className="bg-card">
        <DropdownMenuGroup>
          {entities.map((entity: ISection | ITeam) => (
            <DropdownMenuItem
              key={`seed-section-checkbox-${entity.id}`}
              onClick={(e) => {
                e.preventDefault();

                if (!selectedEntities.find((id) => entity.id === id)) {
                  setSelectedEntities([...selectedEntities, entity.id]);
                } else {
                  setSelectedEntities(
                    selectedEntities.filter((id) => id !== entity.id)
                  );
                }
              }}
            >
              <CheckIcon
                className={cn(
                  !selectedEntities.some((id) => id === entity.id) &&
                    "opacity-0"
                )}
              />
              {entity.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical, Save, UserRoundMinusIcon } from "lucide-react";
import Link from "next/link";

import LabelCell from "@/components/label/label-cell";
import { MoveStudentDialog } from "@/components/modals/student/move-student";
import { sortingHeaderFactory } from "@/components/table/sorting";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const studentCols: ColumnDef<IStudent>[] = [
  {
    accessorKey: "name",
    sortingFn: (studentA, studentB) => {
      const reversedStudentAName = studentA.original.name
        .split(" ")
        .reverse()
        .join(", ");
      const reversedStudentBName = studentB.original.name
        .split(" ")
        .reverse()
        .join(", ");
      return reversedStudentAName.localeCompare(reversedStudentBName);
    },
    header: sortingHeaderFactory("Student name"),
    invertSorting: true,
    sortDescFirst: true,
    cell: ({ row }) => {
      const { name, course_id, id } = row.original;
      const url: string = `/courses/${course_id}/students/${id}`;

      return id != -1 ? (
        <Link className="falafel-link" href={url}>
          {name}
        </Link>
      ) : (
        <Input type="text" placeholder="Enter name..." />
      );
    },
  },
  {
    accessorKey: "major",
    header: sortingHeaderFactory("Major"),
    invertSorting: true,
    sortDescFirst: true,
  },
  {
    id: "studentLabels",
    accessorFn: (row) => row.labels.map((l) => l.name).join(";"),
    header: "Labels",
    cell: ({ row }) => (
      <LabelCell
        id={row.original.id}
        labels={row.original.labels}
        type="student"
      />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const studentId = row.original.id;

      return studentId != -1 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <MoveStudentDialog student={row.original}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <UserRoundMinusIcon />
                Remove from team
              </DropdownMenuItem>
            </MoveStudentDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button className="px-3 cursor-pointer active:scale-95">
          <Save absoluteStrokeWidth={true} strokeWidth={2.5} />
        </Button>
      );
    },
  },
];

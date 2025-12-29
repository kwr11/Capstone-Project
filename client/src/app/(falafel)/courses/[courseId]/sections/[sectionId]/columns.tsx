"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical, PencilIcon, TrashIcon } from "lucide-react";
import Link from "next/link";

import LabelCell from "@/components/label/label-cell";
import { DeleteStudentDialog } from "@/components/modals/student/delete-student";
import { EditStudentDialog } from "@/components/modals/student/edit-student";
import { sortingHeaderFactory } from "@/components/table/sorting";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import _ from "lodash";

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
    enableHiding: false,
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
    id: "Email",
    accessorKey: "email",
    header: sortingHeaderFactory("Email"),
    invertSorting: true,
    sortDescFirst: true,
    cell: ({ row }) => {
      return (
        <Link className="falafel-link" href={`mailto:${row.original.email}`}>
          {row.original.email}
        </Link>
      );
    },
  },
  {
    id: "Labels",
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
    id: "Major",
    accessorKey: "major",
    header: sortingHeaderFactory("Major"),
    invertSorting: true,
    sortDescFirst: true,
  },
  {
    id: "Expertise",
    accessorKey: "expertise",
    header: sortingHeaderFactory("Expertise"),
  },
  {
    id: "Leadership",
    accessorKey: "leadership",
    header: sortingHeaderFactory("Leadership"),
  },
  {
    id: "Languages",
    header: sortingHeaderFactory("Languages"),
    accessorFn: (row) =>
      _.sortBy(row.languages, ["name"])
        .map((l) => l.name)
        .join(", "),
    invertSorting: true,
    sortDescFirst: true,
  },
  {
    id: "Work With",
    header: sortingHeaderFactory("Work With"),
    accessorFn: (row) => _.sortBy(row.work_with, ["name"]).join(", "),
    invertSorting: true,
    sortDescFirst: true,
    sortingFn: (rowA, rowB) => {
      if (
        rowA.original.work_with.length === 0 &&
        rowB.original.work_with.length === 0
      ) {
        return 0;
      }

      if (rowA.original.work_with.length === 0) {
        return 1;
      }

      if (rowB.original.work_with.length === 0) {
        return -1;
      }

      return rowA
        .getValue<string>("Work With")
        .localeCompare(rowB.getValue<string>("Work With"));
    },
  },
  {
    id: "Don't Work With",
    header: sortingHeaderFactory("Don't Work With"),
    accessorFn: (row) => _.sortBy(row.dont_work_with, ["name"]).join(", "),
  },
  {
    enableHiding: false,
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <EditStudentDialog student={row.original}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <PencilIcon />
                Edit
              </DropdownMenuItem>
            </EditStudentDialog>
            <DeleteStudentDialog
              student={{
                id: row.original.id,
                name: row.original.name,
                section_id: row.original.section_id,
                course_id: row.original.course_id,
              }}
            >
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => e.preventDefault()}
              >
                <TrashIcon />
                Delete
              </DropdownMenuItem>
            </DeleteStudentDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

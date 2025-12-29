"use client";

import { DateFormat } from "@/components/date";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical, PencilIcon, TrashIcon } from "lucide-react";
import Link from "next/link";

import { DeleteSectionDialog } from "@/components/modals/section/delete-section";
import { EditSectionDialog } from "@/components/modals/section/edit-section";
import { DeleteTeamDialog } from "@/components/modals/team/delete-team";
import { EditTeamDialog } from "@/components/modals/team/edit-team";
import { sortingHeaderFactory } from "@/components/table/sorting";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LabelCell from "@/components/label/label-cell";

export const sectionCols: ColumnDef<ISection>[] = [
  {
    accessorKey: "name",
    header: sortingHeaderFactory("Section name"),
    invertSorting: true,
    sortDescFirst: true,
    cell: ({ row }) => {
      const { name, course_id, id } = row.original;
      const url: string = `/courses/${course_id}/sections/${id}`;

      return (
        <Link className="falafel-link" href={url}>
          {name}
        </Link>
      );
    },
  },
  {
    header: "Student count",
    accessorFn: (row) => {
      return row.students?.length || 0;
    },
  },
  {
    id: "sectionCreated",
    accessorFn: (row) => new Date(row.created_at),
    sortingFn: "datetime",
    header: sortingHeaderFactory("Created"),
    cell: ({ row }) => {
      const date: Date = new Date(row.original.created_at);

      return <p suppressHydrationWarning>{DateFormat.format(date)}</p>;
    },
  },
  {
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
            <EditSectionDialog section={row.original}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <PencilIcon />
                Edit
              </DropdownMenuItem>
            </EditSectionDialog>
            <DeleteSectionDialog section={row.original}>
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => e.preventDefault()}
              >
                <TrashIcon />
                Delete
              </DropdownMenuItem>
            </DeleteSectionDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const teamCols: ColumnDef<ITeam>[] = [
  {
    accessorKey: "name",
    header: sortingHeaderFactory("Name"),
    cell: ({ row }) => {
      const { name, course_id, id } = row.original;
      const url: string = `/courses/${course_id}/teams/${id}`;

      return (
        <Link className="falafel-link" href={url}>
          {name}
        </Link>
      );
    },
  },
  {
    id: "teamStudents",
    accessorFn: (row) => row.students.map((s) => s.name).join(", "),
    header: sortingHeaderFactory("Students"),
    cell: ({ row }) => {
      return <p>{row.getValue("teamStudents")}</p>;
    },
  },
  {
    id: "teamLabels",
    accessorFn: (row) => row.labels.map((l) => l.name).join(";"),
    header: "Labels",
    cell: ({ row }) => (
      <LabelCell
        id={row.original.id}
        labels={row.original.labels}
        type="team"
      />
    ),
  },
  {
    id: "teamCreated",
    accessorFn: (row) => new Date(row.created_at),
    header: sortingHeaderFactory("Created"),
    sortingFn: "datetime",
    cell: ({ row }) => {
      const date: Date = new Date(row.original.created_at);

      return <p suppressHydrationWarning>{DateFormat.format(date)}</p>;
    },
  },
  {
    id: "actions",
    cell: ({ row: { original } }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              <EllipsisVertical className="h-[1rem]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <EditTeamDialog team={original}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <PencilIcon />
                Edit
              </DropdownMenuItem>
            </EditTeamDialog>
            <DeleteTeamDialog
              team={{
                course_id: original.course_id,
                id: original.id,
                name: original.name,
              }}
            >
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => e.preventDefault()}
              >
                <TrashIcon />
                Delete
              </DropdownMenuItem>
            </DeleteTeamDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

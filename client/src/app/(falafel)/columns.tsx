"use client";

import { DateFormat } from "@/components/date";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical, PencilIcon, TrashIcon } from "lucide-react";
import Link from "next/link";

import { DeleteCourseDialog } from "@/components/modals/course/delete-course";
import { EditCourseDialog } from "@/components/modals/course/edit-course";
import { sortingHeaderFactory } from "@/components/table/sorting";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const courseCols: ColumnDef<ICourse>[] = [
  {
    accessorKey: "name",
    header: sortingHeaderFactory("Course name"),
    invertSorting: true,
    sortDescFirst: true,
    cell: ({ row }) => {
      const { name } = row.original;
      const url: string = `/courses/${row.original.id}`;

      return (
        <Link className="falafel-link" href={url}>
          {name}
        </Link>
      );
    },
  },
  {
    id: "courseCode",
    accessorKey: "code",
    header: sortingHeaderFactory("Course code"),
  },
  {
    id: "courseSections",
    accessorFn: (row) => row.sections.map((s) => s.name).join(", "),
    header: sortingHeaderFactory("Sections"),
    cell: ({ row }) => {
      const { id } = row.original;

      if (row.original.sections?.length > 0) {
        return (
          <div className="space-y-1">
            {row.original.sections.map((section, i) => (
              <Link
                key={`course-cell-link-${i}`}
                className="falafel-link block"
                href={`courses/${id}/sections/${section.id}`}
              >
                {section.name ?? ""}
              </Link>
            ))}
          </div>
        );
      } else {
        return <div className="opacity-50">None</div>;
      }
    },
  },
  {
    header: "Student Count",
    cell: ({ row }) => {
      if (row.original.sections) {
        return row.original.sections.reduce((accumulator, section) => {
          return accumulator + section.students?.length || 0;
        }, 0);
      } else {
        return 0;
      }
    },
  },
  {
    id: "courseCreated",
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
            <EditCourseDialog course={row.original}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <PencilIcon />
                Edit
              </DropdownMenuItem>
            </EditCourseDialog>
            <DeleteCourseDialog
              course={{ id: row.original.id, name: row.original.name }}
            >
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => e.preventDefault()}
              >
                <TrashIcon />
                Delete
              </DropdownMenuItem>
            </DeleteCourseDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

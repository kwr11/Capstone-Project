import { Column, HeaderContext } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";

interface SortingButtonProps<TData, TValue> {
  column: Column<TData, TValue>;
}

export function SortingButton<TData, TValue>({
  column,
}: SortingButtonProps<TData, TValue>) {
  const isSorted = column.getIsSorted();

  return (
    <Button
      variant={isSorted ? "secondary" : "ghost"}
      size="icon"
      className="size-7"
      onClick={() => {
        column.toggleSorting();
      }}
    >
      {!isSorted && <ArrowUpDown />}
      {isSorted === "asc" && <ArrowUp />}
      {isSorted === "desc" && <ArrowDown />}
    </Button>
  );
}

interface SortingHeaderProps<TData, TValue> extends React.PropsWithChildren {
  column: Column<TData, TValue>;
}

export function SortingHeader<TData, TValue>({
  children,
  column,
}: SortingHeaderProps<TData, TValue>) {
  return (
    <div className="flex items-center gap-2">
      {children} <SortingButton column={column} />
    </div>
  );
}

export function sortingHeaderFactory<TData, TValue>(label: string) {
  return function SortingHeaderCmpt({ column }: HeaderContext<TData, TValue>) {
    return <SortingHeader column={column}>{label}</SortingHeader>;
  };
}

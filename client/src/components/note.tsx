"use client";

import { EllipsisVertical, PencilIcon, TrashIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DateFormat } from "./date";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface NoteProps extends React.PropsWithChildren {
  comment: IComment;
  className?: string;
}

export default function Note({ className, comment }: NoteProps) {
  const [content, setContent] = useState<string>(comment.content);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const router = useRouter();

  const updateNote = async () => {
    setIsEditing(!isEditing);
    // TODO Update comment fetch request
    router.refresh();
  };

  return !isEditing ? (
    <Card className={cn("mt-2", className)}>
      <CardContent>
        <p>{comment.content}</p>
      </CardContent>
      <CardFooter>
        <div className="">
          <p
            suppressHydrationWarning
            className="falafel-text opacity-60 text-[0.7rem] relative left-[0.2rem]"
          >
            Created: {DateFormat.format(new Date(comment.created_at))}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="ml-auto">
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setIsEditing(!isEditing)}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              <TrashIcon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  ) : (
    <Card className="pt-4 pb-1 mt-2">
      <CardContent className="relative">
        <div className="flex">
          <Textarea
            className="w-[95%] h-[100%]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <XIcon
            className="absolute right-3 mb-1 cursor-pointer transition hover:text-muted-foreground"
            onClick={() => setIsEditing(!isEditing)}
          />
        </div>
        <div className="flex flex-col justify-between">
          <Button
            onClick={() => updateNote()}
            className="mt-3 mb-2 w-[30%] max-w-[10rem] self-end"
          >
            Submit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

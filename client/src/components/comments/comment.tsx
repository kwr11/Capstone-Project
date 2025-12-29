"use client";

import { updateComment } from "@/actions/comment";
import { cn } from "@/lib/utils";
import _ from "lodash";
import { EditIcon, EllipsisVertical, TrashIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useActionState, useEffect, useState } from "react";
import Markdown from "react-markdown";
import { DateFormat } from "../date";
import { FormField } from "../form-field";
import { DeleteCommentDialog } from "../modals/comment/delete-comment";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Textarea } from "../ui/textarea";

interface CommentFeedProps extends React.ComponentProps<"div"> {
  comments: IComment[];
}

export function CommentFeed({
  comments,
  className,
  ...props
}: CommentFeedProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      {_.orderBy(comments, ["created_at"], "desc").map((c) => (
        <Comment comment={c} key={c.id} />
      ))}
      {comments.length === 0 && (
        <p className="text-sm text-muted-foreground">No comments yet</p>
      )}
    </div>
  );
}

interface CommentProps {
  comment: IComment;
}

export function Comment({ comment }: CommentProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formState, formAction, isFormPending] = useActionState(
    updateComment,
    null
  );
  const router = useRouter();

  useEffect(() => {
    if (formState?.success) {
      setIsEditing(false);
      router.refresh();
    }
  }, [formState]);

  return (
    <div className="border-t border-border pt-3 grid grid-cols-[1fr_max-content]">
      {!isEditing && (
        <div>
          <div>
            <Markdown
              components={{
                "a": (props) => (
                  <a className="falafel-link" target="_blank" {...props} />
                ),
              }}
            >
              {comment.content}
            </Markdown>
          </div>
          <p
            className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap"
            suppressHydrationWarning
          >
            {DateFormat.format(new Date(comment.created_at))}
          </p>
        </div>
      )}
      {isEditing && (
        <form className="grid gap-2" action={formAction}>
          <FormField name="content">
            <Textarea
              name="content"
              id="content"
              className="field-sizing-content max-h-[10lh]"
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === "Enter") {
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              defaultValue={comment.content}
            />
          </FormField>
          <input type="hidden" name="commentId" value={comment.id} />
          <Button size="sm" variant="secondary" disabled={isFormPending}>
            {isFormPending ? "Saving..." : "Save"}
          </Button>
        </form>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => setIsEditing(!isEditing)}>
            {!isEditing ? (
              <>
                <EditIcon />
                Edit
              </>
            ) : (
              <>
                <XIcon />
                Stop editing
              </>
            )}
          </DropdownMenuItem>
          <DeleteCommentDialog commentId={comment.id}>
            <DropdownMenuItem
              variant="destructive"
              onSelect={(e) => e.preventDefault()}
            >
              <TrashIcon />
              Delete
            </DropdownMenuItem>
          </DeleteCommentDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useState } from "react";
import Note from "./note";
import { Button } from "./ui/button";
import { Check, PlusIcon, XIcon } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import LabelCell from "./label/label-cell";

interface TeamProps extends React.PropsWithChildren {
  course: ICourse;
  section?: ISection;
  team: ITeam;
}

const TeamContext = createContext<TeamProps | null>(null);

export function TeamProvider(props: TeamProps) {
  return (
    <TeamContext.Provider value={props}>{props.children}</TeamContext.Provider>
  );
}

export function TeamComments() {
  const ctx = useContext(TeamContext);

  if (!ctx) {
    throw new Error(
      "TeamComments must be used within a TeamProvider component"
    );
  }

  const [newContent, setNewContent] = useState<string>("");
  const [newOpen, setNewOpen] = useState<boolean>(false);
  const router = useRouter();

  const createNote = async () => {
    setNewOpen(!newOpen);
    // TODO Create comment fetch request
    setNewContent("");
    router.refresh();
  };

  const buildComments = () => {
    return ctx.team.comments
      .sort(
        (
          a,
          b // Sorts comments in descending order by updated date
        ) => String(b.created_at).localeCompare(String(a.created_at))
      )
      .map((comment) => (
        <Note key={`comment-${comment.id}`} comment={comment} />
      ));
  };

  return ctx.team.comments.length > 0 && !newOpen ? (
    <div className="mt-3">
      <div className="flex items-center">
        <h3 className="font-semibold">Notes:</h3>
        <Button
          onClick={() => setNewOpen(!newOpen)}
          className="ml-auto px-2! h-8 gap-[0.2rem]"
        >
          <PlusIcon />
          New
        </Button>
      </div>
      {buildComments()}
    </div>
  ) : (
    <div className="mt-5 max-w-[50rem] mx-auto">
      <div className="flex items-center">
        <h3 className="font-semibold">Notes:</h3>
        {ctx.team.comments.length > 0 && (
          <XIcon
            className="ml-auto cursor-pointer transition hover:text-muted-foreground"
            onClick={() => setNewOpen(!newOpen)}
          />
        )}
      </div>
      <Textarea
        value={newContent}
        onChange={(e) => setNewContent(e.target.value)}
        className="min-h-25"
        placeholder="Enter note..."
      />
      <Button className="mt-3" onClick={() => createNote()}>
        Submit
      </Button>
    </div>
  );
}

export function TeamDetailsPane() {
  const ctx = useContext(TeamContext);

  if (!ctx) {
    throw new Error(
      "TeamDetailsPane must be used within a TeamProvider component"
    );
  }

  // Determines if all students in the team are in the same section
  const matchingSections: boolean = (() =>
    new Set(ctx.team.students.map((student) => student.section_id)).size <=
    1)();

  return (
    <Card className="min-w-[20rem]">
      <CardHeader>
        <CardTitle>Team Details</CardTitle>
        <p className="flex">
          All students in same section:⠀
          <span>{matchingSections ? <Check /> : <XIcon />}</span>
        </p>
        <LabelCell id={ctx.team.id} labels={ctx.team.labels} type="team" />
      </CardHeader>
      <CardContent>
        <TeamComments />
      </CardContent>
    </Card>
  );
}

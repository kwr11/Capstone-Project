"use client";

import { useRouter } from "next/navigation";

import { deleteLabel, updateLabel } from "@/actions/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { doServerAction } from "@/lib/utils.client";
import Color from "color";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { FormField } from "../form-field";
import { FALAFELLabel } from "../label";
import { FALAFELColorPicker } from "../settings/components";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

interface LabelDialogProps extends React.PropsWithChildren {
  label: ILabel;
}

export function LabelEditorDialog({ children, label }: LabelDialogProps) {
  const [labelName, setLabelName] = useState(label.name);
  const [formState, formAction, isFormPending] = useActionState(
    updateLabel,
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [currentColor, setCurrentColor] = useState<string>(
    Color.hsl(label.color).toString()
  );
  const router = useRouter();

  useEffect(() => {
    if (formState?.success) {
      setIsDialogOpen(false);
      router.refresh();
    }
  }, [formState, router]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit a label</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-4">
            <FormField name="name" errors={formState?.fieldErrors?.name}>
              <FormField.Label>Label name</FormField.Label>
              <FormField.Input
                type="text"
                placeholder="Follow up"
                autoComplete="off"
                maxLength={25}
                onChange={(e) => setLabelName(e.target.value)}
                value={labelName}
              />
            </FormField>
            <div className="flex">
              <div className="flex">
                <Label className="mr-2">Label Color</Label>
                <FALAFELColorPicker
                  currentColor={currentColor}
                  setCurrentColor={setCurrentColor}
                />
              </div>
              <div className="flex ml-auto">
                <Label className="mr-2">Preview:</Label>
                <FALAFELLabel
                  name={labelName || "Label"}
                  color={currentColor}
                />
              </div>
            </div>
            <input type="hidden" name="labelId" value={label.id} />
            <input type="hidden" name="color" value={currentColor} />
            {formState?.error && (
              <p className="text-destructive">{formState.error.message}</p>
            )}
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isFormPending}>
              {!isFormPending ? "Save" : "Saving..."}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function LabelDeleteDialog({ children, label }: LabelDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const router = useRouter();

  async function doDeleteLabel() {
    const [, error] = await doServerAction(deleteLabel(label.id));

    if (error) {
      setError(error.message);
    } else {
      toast.success(
        "Label deleted. You may need to refresh the page to see changes."
      );
    }

    router.refresh();
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            If you delete this label, it will be gone permanently. All Students
            and Teams with this label will have it removed.
          </DialogDescription>
        </DialogHeader>
        <div>
          <p>
            Are you sure you want to delete <strong>{label.name}</strong>?
          </p>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant={"destructive"} onClick={doDeleteLabel}>
            Delete {label.name}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CompMapInfoDialog({ children }: React.PropsWithChildren) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Student Suggestions</DialogTitle>
          <DialogDescription>
            Learn more about how the algorithm works, and how to modify it to
            fit your needs.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <h2 className="text-lg font-medium">Weight</h2>
          <p className="text-muted-foreground">
            Each property that the algorithm compares can be assigned a weight.
            If the algorithm determines that a student would be a good fit for a
            team, that student will gain that weight. Then, all students are
            ranked from highest to lowest weight to provide recommendations.
          </p>
        </div>
        <div className="grid gap-2">
          <h2 className="text-lg font-medium">Difference</h2>
          <p className="text-muted-foreground">
            When comparing numeric fields, we offer the option to suggest
            students on an &quot;internal&quot; or &quot;external&quot; range.
            If &quot;internal&quot; is chosen, any student whose field value is
            within &plusmn;<em>n</em> of the team&apos;s average for that value
            will be suggested. If &quot;external&quot; is chosen, any student
            whose field value is outside of that range will be suggested.
          </p>
        </div>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Got it</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

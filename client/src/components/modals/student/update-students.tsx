"use client";

import { getCSVHeaders } from "@/actions/csv";
import { updateStudents } from "@/actions/student";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { ChangeEvent, useActionState, useEffect, useState } from "react";

enum UpdateStudentsDialogStep {
  UPLOAD_CSV,
  PROCESSING_CSV,
  MAP_COLUMNS,
}

interface UpdateStudentsDialogProps extends React.PropsWithChildren {
  courseId: number;
  sectionId: number;
}

const MIN_COLS_COUNT = 2;

const createStudentKeys = [
  {
    name: "email",
    display: "Email",
  },
  {
    name: "expertise",
    display: "Expertise",
  },
  {
    name: "leadership",
    display: "Leadership",
  },
  {
    name: "languages",
    display: "Languages",
  },
  {
    name: "frameworks",
    display: "Frameworks",
  },
  {
    name: "workWith",
    display: "Work With",
  },
  {
    name: "dontWorkWith",
    display: "Don't Work With",
  },
] as const;

export function UpdateStudentsDialog({
  courseId,
  sectionId,
  children,
}: UpdateStudentsDialogProps) {
  const [formState, formAction, isFormPending] = useActionState(
    updateStudents,
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [csvReadError, setCSVReadError] = useState<string>();
  const [csvHeaders, setCSVHeaders] = useState<string[]>();
  const [step, setStep] = useState<UpdateStudentsDialogStep>(
    UpdateStudentsDialogStep.UPLOAD_CSV
  );
  const router = useRouter();

  useEffect(() => {
    setStep(UpdateStudentsDialogStep.UPLOAD_CSV);
    setCSVReadError(undefined);
    setCSVHeaders(undefined);
  }, [isDialogOpen]);

  useEffect(() => {
    if (formState?.success) {
      setIsDialogOpen(false);
      router.refresh();
    }
  }, [router, formState]);

  async function processCSV(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) {
      setStep(UpdateStudentsDialogStep.UPLOAD_CSV);
      return;
    }

    setStep(UpdateStudentsDialogStep.PROCESSING_CSV);

    try {
      const headers = await getCSVHeaders(file);
      if (headers.length < MIN_COLS_COUNT) {
        setStep(UpdateStudentsDialogStep.UPLOAD_CSV);
        setCSVReadError(
          `Insufficient number of columns in CSV. Minimum ${MIN_COLS_COUNT}`
        );
        return;
      }

      setCSVHeaders(headers);
      setStep(UpdateStudentsDialogStep.MAP_COLUMNS);
    } catch (e) {
      setCSVReadError("An error occurred reading your CSV file");
      console.error(e);
    }
  }

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        {step !== UpdateStudentsDialogStep.MAP_COLUMNS && <UploadCSVHeader />}
        {step === UpdateStudentsDialogStep.MAP_COLUMNS && <MapColumnsHeader />}
        <form action={formAction} className="max-w-full overflow-hidden">
          <div className="grid gap-4">
            <FormField name="file" errors={formState?.fieldErrors?.file}>
              <FormField.Label>Upload CSV</FormField.Label>
              <FormField.Input
                type="file"
                accept=".csv"
                onChange={processCSV}
                key={"fileinput"}
              />
            </FormField>
          </div>
          <input type="hidden" name="sectionId" value={sectionId} />
          <input type="hidden" name="courseId" value={courseId} />
          {csvReadError && <p className="text-destructive">{csvReadError}</p>}
          {step === UpdateStudentsDialogStep.PROCESSING_CSV && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Processing your file...
            </p>
          )}
          {step === UpdateStudentsDialogStep.MAP_COLUMNS && (
            <div className="grid grid-cols-[max-content_1fr] max-w-full overflow-hidden max-sm:grid-cols-1 gap-y-2 gap-x-4 mt-6">
              {createStudentKeys.map((field, idx) => {
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-subgrid gap-y-2 items-center col-span-full w-0 min-w-full"
                  >
                    <label htmlFor={field.name}>{field.display}</label>
                    <Select name={field.name}>
                      <SelectTrigger className="w-0 min-w-full overflow-clip [&>span]:truncate">
                        <SelectValue placeholder="Choose field..." />
                      </SelectTrigger>
                      <SelectContent>
                        {csvHeaders?.map((header) => {
                          return (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {formState?.fieldErrors?.[field.name] && (
                      <p className="text-destructive">
                        {formState.fieldErrors[field.name]}
                      </p>
                    )}
                  </div>
                );
              })}
              {formState?.error && (
                <p className="text-destructive col-span-full">
                  {formState.error.message}
                </p>
              )}
              <DialogFooter className="mt-4 col-span-full">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={
                    isFormPending ||
                    step !== UpdateStudentsDialogStep.MAP_COLUMNS
                  }
                >
                  {!isFormPending ? "Save" : "Saving..."}
                </Button>
              </DialogFooter>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UploadCSVHeader() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Add survey data</DialogTitle>
        <DialogDescription>
          Upload a CSV of survey responses to get started
        </DialogDescription>
      </DialogHeader>
    </>
  );
}

function MapColumnsHeader() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Map columns</DialogTitle>
        <DialogDescription>
          {"Map your columns to the data we need and we'll be set!"}
        </DialogDescription>
      </DialogHeader>
    </>
  );
}

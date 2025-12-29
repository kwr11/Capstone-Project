"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import React, { createContext, useContext } from "react";

const FormFieldContext = createContext<FormFieldProps | null>(null);

interface FormFieldProps extends React.PropsWithChildren {
  errors?: string[];
  name: string;
}

export function FormField(props: FormFieldProps) {
  return (
    <FormFieldContext.Provider value={props}>
      <div className="grid gap-2">
        {props.children}
        {props.errors?.map((error, idx) => {
          return (
            <p key={idx} className="text-sm text-destructive">
              {error}
            </p>
          );
        })}
      </div>
    </FormFieldContext.Provider>
  );
}

FormField.Label = function FormFieldLabel(
  props: React.ComponentProps<"label">
) {
  const ctx = useContext(FormFieldContext);
  if (!ctx)
    throw new Error(
      "FormField.Label must be used within a FormField component"
    );

  return (
    <Label htmlFor={ctx.name} {...props}>
      {props.children}
    </Label>
  );
};

FormField.Description = function FormFieldDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  const ctx = useContext(FormFieldContext);
  if (!ctx)
    throw new Error(
      "FormField.Description must be used within a FormField component"
    );

  return (
    <p
      className={cn(
        "text-muted-foreground text-sm flex gap-1 items-center",
        className
      )}
      {...props}
    >
      <InfoIcon size={14} /> {props.children}
    </p>
  );
};

FormField.Input = function FormFieldInput(
  props: React.ComponentProps<"input">
) {
  const ctx = useContext(FormFieldContext);
  if (!ctx)
    throw new Error(
      "FormField.Input must be used within a FormField component"
    );
  const inputProps = { name: ctx.name, id: ctx.name, ...props };

  return <Input {...inputProps} />;
};

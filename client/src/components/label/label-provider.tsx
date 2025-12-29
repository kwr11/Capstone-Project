"use client";

import { ErrorResult, SuccessResult } from "@/lib/utils";
import { createContext } from "react";

type AssignerFn = (
  labelIds: number[],
  teamId?: number,
  studentId?: number
) => Promise<ErrorResult | SuccessResult<boolean>>;

export const LabelContext = createContext<
  | {
      labels: ILabel[];
      assigner: AssignerFn;
    }
  | undefined
>(undefined);

interface LabelProviderProps extends React.PropsWithChildren {
  labels: ILabel[];
  assigner: AssignerFn;
}

export function LabelProvider({
  children,
  labels,
  assigner,
}: LabelProviderProps) {
  return (
    <LabelContext.Provider value={{ labels: labels, assigner: assigner }}>
      {children}
    </LabelContext.Provider>
  );
}

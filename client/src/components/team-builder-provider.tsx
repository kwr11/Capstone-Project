"use client";

import { createContext } from "react";

export const TeamBuilderContext = createContext<ICourse | undefined>(undefined);

interface TeamProviderProps extends React.PropsWithChildren {
  value: ICourse;
}

export function TeamBuilderProvider({ children, value }: TeamProviderProps) {
  return (
    <TeamBuilderContext.Provider value={value}>
      {children}
    </TeamBuilderContext.Provider>
  );
}

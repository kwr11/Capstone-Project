"use client";

import { Flags } from "@/lib/ranking-algo";
import jwt from "jsonwebtoken";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface SettingsValue {
  compMap: IStudentComparisonMap;
  updateCompMap: (updates: Partial<IStudentComparisonMap>) => void;
}

const SettingsContext = createContext<SettingsValue | undefined>(undefined);

const DEFAULT_COMP_MAP: IStudentComparisonMap = {
  frameworks: {
    weight: 5,
    flags: [Flags.Shared, Flags.NonNull],
  },
  languages: {
    weight: 5,
    flags: [Flags.Shared, Flags.NonNull],
  },
  section_id: {
    weight: 0,
    flags: [Flags.Equal],
  },
  work_with: {
    weight: 7,
    flags: [Flags.WorkWith],
  },
  dont_work_with: {
    weight: -20,
    flags: [Flags.DontWorkWith],
  },
  expertise: {
    weight: 7,
    flags: [Flags.Proximity, Flags.NonNull],
    difference: 4,
    type: "external",
  },
  major: {
    weight: 0,
    flags: [Flags.Equal],
  },
  leadership: {
    weight: 0,
    flags: [Flags.Proximity, Flags.NonNull],
    type: "external",
    difference: 3,
  },
};

export function SettingsProvider({ children }: React.PropsWithChildren) {
  const [compMap, setCompMap] =
    useState<SettingsValue["compMap"]>(DEFAULT_COMP_MAP);
  const userId = useRef<number | null>(null);

  const loadSettings = useCallback(() => {
    if (!userId.current) return;
    const KEY = `settings-${userId.current}`;
    const userSettings = localStorage.getItem(KEY);

    if (userSettings) {
      const jsonSettings = JSON.parse(userSettings);
      setCompMap(jsonSettings);
    }
  }, [userId]);

  const updateCompMap = useCallback(
    (updated: Partial<IStudentComparisonMap>) => {
      if (!userId.current) return;

      const KEY = `settings-${userId.current}`;

      const newCompMap = {
        ...compMap,
        ...updated,
      };

      const jsonSettings = JSON.stringify(newCompMap);

      localStorage.setItem(KEY, jsonSettings);

      setCompMap(newCompMap);
    },
    [compMap, userId]
  );

  useEffect(() => {
    // Cheap way to get current user without async
    const user = jwt.decode(
      document.cookie
        .split(";")
        .find((c) => c.trim().startsWith("session"))
        ?.split("=")[1] || ""
    );

    if (user) {
      userId.current = typeof user.sub === "string" ? Number(user.sub) : null;
      loadSettings();
    }
  }, [loadSettings]);

  return (
    <SettingsContext.Provider value={{ compMap, updateCompMap }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used in a SettingsProvider");

  return ctx;
}

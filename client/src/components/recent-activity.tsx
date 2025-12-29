"use client";

import { getCurrentUser } from "@/actions/auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export function RecentActivity() {
  const [recents, setRecents] = useState<IRecentActivity[]>([]);

  useEffect(() => {
    (async () => {
      const [user] = await getCurrentUser();
      if (!user) return;
      const recents = JSON.parse(
        localStorage.getItem(`recents-${user.sub}`) || "[]"
      ) as IRecentActivity[];
      setRecents(recents);
    })();
  }, []);

  return recents.map((recent, i) => (
    <Button
      key={i}
      variant="secondary"
      size="sm"
      className="rounded-[2rem] mx-1 text-[0.8rem] text-card-foreground bg-card border border-border not-dark:shadow-xs"
      asChild
    >
      <Link href={recent.url}>{recent.label}</Link>
    </Button>
  ));
}

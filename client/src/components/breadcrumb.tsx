"use client";

import Link from "next/link";
import React, { useEffect } from "react";

import { getCurrentUser } from "@/actions/auth";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function FALAFELBreadcrumbs({
  pathList,
}: {
  pathList: ILinkComponent[];
}) {
  useEffect(() => {
    (async () => {
      const [user] = await getCurrentUser();
      if (!user) return;

      // If the current page is home, skip. We do not want to have a pill for home.
      if (pathList.at(-1)?.url === "/") return;

      // Get the recents for the current user from localStorage, or default to an empty array
      let recents = JSON.parse(
        localStorage.getItem(`recents-${user.sub}`) || "[]"
      ) as IRecentActivity[];

      // Prepend the current page to the list of recents for the current user
      recents = [
        {
          label: pathList.reduce((acc, link) => {
            /**
             * Excluding home, build a string containing the names of pages separated by "/"
             */
            if (link.label === "Home") return acc;
            return acc === "" ? link.label : `${acc} / ${link.label}`;
          }, ""),
          url: pathList.at(-1)?.url || "#",
        },
        ...recents,
      ];

      // Update the item in localStorage to be up-to-date
      localStorage.setItem(
        `recents-${user.sub}`,
        JSON.stringify(
          recents
            .reduce((acc, recent) => {
              /**
               * Removes duplicate entries. If I go to /course/1 twice in a row, it should only show once
               */
              if (acc.find((v: { url: string }) => v.url === recent.url)) {
                return acc;
              } else {
                return acc.concat(recent);
              }
            }, [] as IRecentActivity[])
            // Only keep the most recent 3
            .slice(0, 3)
        )
      );
    })();
  }, [pathList]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathList.map((path, i) => {
          if (i === pathList.length - 1) {
            return (
              <BreadcrumbItem key={path.label}>
                <BreadcrumbPage className="falafel-link no-underline!">
                  {path.label}
                </BreadcrumbPage>
              </BreadcrumbItem>
            );
          } else {
            return (
              <React.Fragment key={path.label}>
                <BreadcrumbItem>
                  <BreadcrumbLink key={path.label} asChild>
                    <Link className="falafel-text" href={path.url}>
                      {path.label}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>/</BreadcrumbSeparator>
              </React.Fragment>
            );
          }
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

import type { ReactNode } from "react";

export default function CourseLayout({
  children,
  students,
}: {
  children: ReactNode;
  students: ReactNode;
}) {
  return (
    <>
      {children}
      {students}
    </>
  );
}

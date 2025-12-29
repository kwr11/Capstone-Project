import Link from "next/link";

interface ErrorPageProps {
  header?: string;
  text: string;
}

export function ErrorPage({ header, text }: ErrorPageProps) {
  return (
    <div className="min-h-[calc(100svh-var(--spacing)*30)] grid place-content-center">
      {header && <h1 className="mb-4 text-[3rem] font-extrabold">{header}</h1>}
      <p className="text-muted-foreground text-lg">
        {`${text} `}
        <Link className="falafel-link" href="/">
          Go home.
        </Link>
      </p>
    </div>
  );
}

import { ErrorPage } from "@/components/error-page";

export default function NotFound() {
  return (
    <ErrorPage
      header="Not found"
      text="We couldn't find what you are looking for."
    />
  );
}

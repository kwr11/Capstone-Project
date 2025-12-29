import { getAllLabels } from "@/actions/label";
import { FALAFELSettings } from "./components";

export default async function FALAFELSettingsSheet({
  children,
}: React.PropsWithChildren) {
  const [labels] = await getAllLabels();

  return <FALAFELSettings labels={labels}>{children}</FALAFELSettings>;
}

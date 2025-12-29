import { cn } from "@/lib/utils";
import Color from "color";

export function FALAFELLabel({
  classname,
  name,
  color,
}: {
  classname?: string;
  name: string;
  color: string;
}) {
  return (
    <label
      style={
        {
          "--label-bg": color,
          "--label-text": Color.hsl(color).lightness(75).toString(),
        } as React.CSSProperties
      }
      className={cn(
        "falafel-label-alpha opacity-85 text-center px-3 py-[0.3rem] rounded-[1rem] min-h-8 max-w-60 truncate",
        classname
      )}
    >
      {name}
    </label>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
} from "@/components/ui/shadcn-io/color-picker";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { logout } from "@/actions/auth";
import { createLabel } from "@/actions/label";
import { cn } from "@/lib/utils";
import { doServerAction } from "@/lib/utils.client";
import Color, { ColorLike } from "color";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  CircleQuestionMarkIcon,
  InfoIcon,
  LogOutIcon,
  Pencil,
  SaveIcon,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  SetStateAction,
  useActionState,
  useEffect,
  useState,
} from "react";
import { FormField } from "../form-field";
import { FALAFELLabel } from "../label";
import {
  CompMapInfoDialog,
  LabelDeleteDialog,
  LabelEditorDialog,
} from "../modals/settings";
import { useSettings } from "../settings-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface LabelProps extends React.PropsWithChildren {
  labels: ILabel[] | null;
}

interface Theme {
  name: string;
  label: string;
}

const ThemeList: Theme[] = [
  {
    name: "default",
    label: "Default",
  },
  {
    name: "amber-minimal",
    label: "Amber Minimal",
  },
  {
    name: "bubblegum",
    label: "Bubblegum",
  },
  {
    name: "cosmic-night",
    label: "Cosmic Night",
  },
  {
    name: "darkmatter",
    label: "Darkmatter",
  },
  {
    name: "doom-64",
    label: "Doom 64",
  },
  {
    name: "sage-garden",
    label: "Sage Garden",
  },
  {
    name: "twitter",
    label: "Twitter",
  },
  {
    name: "vintage-paper",
    label: "Vintage Paper",
  },
];

function ThemeSelector() {
  const [theme, setTheme] = useState<string>(
    localStorage.getItem("theme")?.split("-").slice(0, -1).join("-") ||
      "default"
  );
  const [mode, setMode] = useState<string>(
    localStorage.getItem("theme")?.split("-").at(-1) || "dark"
  );

  const handleTheme = (newTheme: string, newMode?: string) => {
    const html = document.documentElement;

    // Modifies root html classes
    ThemeList.forEach((cls) => html.classList.remove(`${cls.name}-${mode}`));
    html.classList.add(`${newTheme}-${newMode ?? mode}`);

    // Stores the theme in persistent storage
    localStorage.setItem("theme", `${newTheme}-${newMode ?? mode}`);

    setTheme(newTheme);
  };

  const handleMode = (newMode: string) => {
    // Resets the theme
    handleTheme(theme, newMode);

    setMode(newMode);
  };

  return (
    <div>
      <p className="text-lg falafel-text font-medium mb-2">Theme</p>
      <div className="flex gap-5">
        <Select value={theme} onValueChange={handleTheme}>
          <SelectTrigger className="w-[100%]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ThemeList.map((themeItem) => (
                <SelectItem key={themeItem.name} value={themeItem.name}>
                  {themeItem.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <RadioGroup value={mode} onValueChange={handleMode}>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="light" id="r1" />
            <Label htmlFor="r1">Light</Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="dark" id="r2" />
            <Label htmlFor="r2">Dark</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}

export function FALAFELColorPicker({
  currentColor,
  setCurrentColor,
}: {
  currentColor: string;
  setCurrentColor: Dispatch<SetStateAction<string>>;
}) {
  const handleColorPick = (colorArr: ColorLike) => {
    setCurrentColor(Color(colorArr).hsl().toString());
  };

  return (
    <Popover>
      <PopoverTrigger>
        <div className="flex h-9 w-9 bg-transparent rounded-[0.5rem] hover:bg-gray-400/10! border-1 border-gray-400/30">
          <div
            className="align-middle m-auto rounded-full w-[1.5rem] h-[1.5rem]"
            style={{ backgroundColor: currentColor }}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="mr-5 w-100 h-90">
        <ColorPicker
          className="max-w-sm rounded-md border bg-background p-4 shadow-sm"
          defaultValue={currentColor}
          onChange={handleColorPick}
        >
          <ColorPickerSelection />
          <div className="flex items-center gap-4">
            <div className="grid w-full gap-1">
              <ColorPickerHue />
              <ColorPickerAlpha />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ColorPickerOutput />
            <ColorPickerFormat />
          </div>
        </ColorPicker>
      </PopoverContent>
    </Popover>
  );
}

function LabelBrowser({ labels }: LabelProps) {
  return (
    <div>
      <p className="text-lg falafel-text font-medium mb-2">Labels</p>
      <div>
        {labels && labels.length > 0 ? (
          labels.map((label) => {
            return (
              <div
                key={`label-${label.id}`}
                className="flex justify-between items-center my-2"
              >
                <FALAFELLabel name={label.name} color={label.color} />
                <LabelEditorDialog label={label}>
                  <Button className="ml-auto" variant="ghost">
                    <Pencil size={18} />
                  </Button>
                </LabelEditorDialog>
                <LabelDeleteDialog label={label}>
                  <Button className="ml-1" variant="ghost">
                    <Trash size={18} color="#FF6467" />
                  </Button>
                </LabelDeleteDialog>
              </div>
            );
          })
        ) : (
          <p className="falafel-text opacity-60 text-sm">No Labels</p>
        )}
      </div>
    </div>
  );
}

function LabelCreator() {
  const [formState, formAction, isFormPending] = useActionState(
    createLabel,
    null
  );
  const [currentColor, setCurrentColor] = useState<string>(
    "hsla(0, 0%, 100%, 1)"
  );
  const router = useRouter();

  useEffect(() => {
    if (formState?.success) {
      router.refresh();
    }
  }, [formState, router]);

  return (
    <div>
      <form action={formAction} className="flex w-full">
        <FormField name="name">
          <FormField.Input
            type="text"
            placeholder="New Label"
            className="w-40 mr-2"
            defaultValue={formState?.fields?.name}
          />
        </FormField>
        <FALAFELColorPicker
          currentColor={currentColor}
          setCurrentColor={setCurrentColor}
        />
        <input type="hidden" name="color" value={currentColor} />
        <Button
          type="submit"
          variant="ghost"
          disabled={isFormPending}
          className="cursor-pointer falafel-link no-underline! ml-auto"
        >
          <SaveIcon />
          Save
        </Button>
      </form>
      {formState?.fieldErrors?.name && (
        <p className="text-destructive mt-1">{formState?.fieldErrors?.name}</p>
      )}
    </div>
  );
}

function CompMapEditor() {
  const [isCompMapOpen, setIsCompMapOpen] = useState<boolean>(false);

  return (
    <>
      <Button
        variant="ghost"
        size="lg"
        className="grid grid-cols-[1fr_max-content] h-auto min-h-9 gap-y-1 py-3 -my-3 justify-items-start items-center px-4 -mx-4"
        onClick={() => setIsCompMapOpen(true)}
      >
        <span className="col-start-1 text-lg falafel-text font-medium">
          Student Suggestions
        </span>
        <span className="col-start-1 col-span-2 text-wrap text-left block max-w-full font-normal text-sm text-muted-foreground">
          Modify how your pairing algorithm recommends students for your teams.
        </span>
        <ArrowRight className="col-start-2 row-start-1" />
      </Button>
      <div
        className={cn(
          "absolute inset-0 overflow-auto p-4 bg-background transition-transform",
          !isCompMapOpen && "translate-x-full"
        )}
      >
        <p className="text-lg sticky top-0 bg-background border-b pb-2 falafel-text flex items-center gap-2 font-medium mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCompMapOpen(false)}
          >
            <ArrowLeft />
          </Button>
          Student Suggestions
          <CompMapInfoDialog>
            <Button size="icon-sm" variant="ghost">
              <CircleQuestionMarkIcon />
            </Button>
          </CompMapInfoDialog>
        </p>
        <div className="grid grid-cols-[max-content_1fr] gap-3">
          <AlgorithmSettingModifier label="Major" prop="major" />
          <AlgorithmSettingModifier
            label="Expertise"
            prop="expertise"
            tooltip="On a scale from 1 to 10"
          />
          <AlgorithmSettingModifier
            label="Leadership"
            prop="leadership"
            tooltip="On a scale from 1 to 10"
          />
          <AlgorithmSettingModifier
            label="Languages"
            prop="languages"
            tooltip="Comma-separated list of known languages"
          />
          <AlgorithmSettingModifier
            label="Frameworks"
            prop="frameworks"
            tooltip="Comma-separated list of known frameworks"
          />
          <AlgorithmSettingModifier label="Work with" prop="work_with" />
          <AlgorithmSettingModifier
            label="Don't work with"
            prop="dont_work_with"
          />
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsCompMapOpen(false)}
          >
            Close
          </Button>
          <p className="text-sm text-muted-foreground italic mt-2">
            All changes are saved as you edit
          </p>
        </div>
      </div>
    </>
  );
}

interface AlgorithmSettingModifierProps {
  prop: keyof IStudentComparisonMap;
  label: string;
  tooltip?: string;
}

function AlgorithmSettingModifier({
  prop,
  label,
  tooltip,
}: AlgorithmSettingModifierProps) {
  const { compMap, updateCompMap } = useSettings();

  function doUpdateValue({
    newWeight,
    newDifference,
    newType,
  }: {
    newWeight?: number;
    newDifference?: number;
    newType?: IStudentComparisonMap["expertise"]["type"];
  }) {
    updateCompMap({
      [prop]: {
        ...compMap[prop],
        ...(newWeight !== undefined && { weight: newWeight }),
        ...(newDifference !== undefined && { difference: newDifference }),
        ...(newType !== undefined && { type: newType }),
      },
    });
  }

  return (
    <div className="grid col-span-full grid-cols-subgrid gap-y-2 items-center">
      <span className="inline-flex gap-2 w-full col-span-full">
        {label}{" "}
        {tooltip && (
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon size={12} />
            </TooltipTrigger>
            <TooltipContent className="text-foreground">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </span>
      <label
        htmlFor={`weight-${prop}`}
        className="text-sm text-muted-foreground font-light mr-3"
      >
        Weight
      </label>
      <div className="grid grid-cols-[1fr_max-content]">
        <Input
          type="number"
          id={`weight-${prop}`}
          className="rounded-tr-none rounded-br-none"
          name="weight"
          value={compMap[prop].weight}
          onChange={(e) =>
            doUpdateValue({ newWeight: Number(e.currentTarget.value) })
          }
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="rounded-tl-none rounded-bl-none border-input border-l-transparent!"
            >
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => doUpdateValue({ newWeight: 20 })}>
              Priority (20)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => doUpdateValue({ newWeight: 10 })}>
              Heavy (10)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => doUpdateValue({ newWeight: 5 })}>
              Medium (5)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => doUpdateValue({ newWeight: 2 })}>
              Light (2)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => doUpdateValue({ newWeight: 0 })}>
              Ignore (0)
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => doUpdateValue({ newWeight: -10 })}
            >
              Discourage (-10)
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => doUpdateValue({ newWeight: -50 })}
            >
              Forbid (-50)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {compMap[prop].difference !== undefined && (
        <div className="col-span-full grid grid-cols-subgrid items-center">
          <label
            htmlFor={`difference-${prop}`}
            className="text-sm text-muted-foreground font-light mr-3"
          >
            Difference
          </label>
          <div className="grid grid-cols-[1fr_max-content]">
            <Input
              type="number"
              id={`difference-${prop}`}
              className="rounded-tr-none rounded-br-none"
              name="difference"
              value={compMap[prop].difference}
              onChange={(e) =>
                doUpdateValue({ newDifference: Number(e.currentTarget.value) })
              }
            />
            <Select
              onValueChange={(val: "internal" | "external") =>
                doUpdateValue({ newType: val })
              }
              defaultValue={compMap[prop].type}
            >
              <SelectTrigger className="rounded-tl-none rounded-bl-none border-input border-l-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="external">External</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}

export function FALAFELSettings({ children, labels }: LabelProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-[1.5rem]">Settings</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col max-h-full gap-4 px-5 h-full overflow-hidden content-start">
          <ThemeSelector />
          <hr />
          <div className="max-h-[50svh] overflow-y-auto">
            <LabelBrowser labels={labels} />
            <LabelCreator />
          </div>
          <hr />
          <CompMapEditor />
        </div>
        <SheetFooter className="border-t border-border">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              localStorage.clear();
              doServerAction(logout());
            }}
          >
            <LogOutIcon />
            Logout
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

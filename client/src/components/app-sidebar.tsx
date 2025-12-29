import Image from "next/image";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";

import {
  ChevronRight,
  Home,
  LucideIcon,
  PlusIcon,
  Settings,
} from "lucide-react";

import { getAllCourses } from "@/actions/course";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { LogoutButton } from "./auth/logout-button";
import { AddCourseDialog } from "./modals/course/create-course";
import { AddSectionDialog } from "./modals/section/create-section";
import FALAFELSettingsSheet from "./settings/sheet";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface MenuItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subitems?: MenuItem[];
  courseId?: number;
}

function LinkMenuItem({ item }: { item: MenuItem }) {
  return (
    <SidebarMenuItem>
      {item.title === "Settings" ? (
        <FALAFELSettingsSheet>
          <SidebarMenuButton className="cursor-pointer">
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </SidebarMenuButton>
        </FALAFELSettingsSheet>
      ) : (
        <SidebarMenuButton asChild>
          <a href={item.url}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </a>
        </SidebarMenuButton>
      )}
    </SidebarMenuItem>
  );
}

function CollapsibleMenuItem({ item }: { item: MenuItem }) {
  if (!item.subitems) throw new Error("Collapsible menus must have subitems");

  return (
    <Collapsible className="group/collapsible cursor-pointer">
      <CollapsibleTrigger asChild>
        <SidebarMenuButton asChild>
          <div>
            {item.icon && <item.icon />}
            <span className="select-none">{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </div>
        </SidebarMenuButton>
      </CollapsibleTrigger>
      <CollapsibleContent
        className={cn(
          "text-popover-foreground outline-none",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=top]:slide-in-from-bottom-2",
          "data-[side=right]:slide-in-from-left-2",
        )}
      >
        <SidebarMenuSub>
          {item.subitems.map((subitem) => (
            <SidebarMenuButton asChild key={subitem.title}>
              <a href={subitem.url}>
                <span>{subitem.title}</span>
              </a>
            </SidebarMenuButton>
          ))}
          {item.courseId && (
            <AddSectionDialog courseId={item.courseId}>
              <SidebarMenuButton className="text-muted-foreground cursor-pointer">
                <PlusIcon />
                Add Section
              </SidebarMenuButton>
            </AddSectionDialog>
          )}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}

export async function AppSidebar() {
  const [courses] = await getAllCourses();

  const items: MenuItem[] = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Settings",
      url: "",
      icon: Settings,
    },
  ];

  const courseItems: MenuItem[] =
    courses?.map((course) => {
      const sectionItems: MenuItem[] = course.sections.map((section) => {
        return {
          title: section.name,
          url: `/courses/${course.id}/sections/${section.id}`,
        };
      });

      return {
        title: course.name,
        url: "",
        subitems: sectionItems,
        courseId: course.id,
      };
    }) || [];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="sticky top-0 inline-block w-fit pl-2 pr-22 py-5 mt-[-8px] bg-sidebar z-1">
            <Link href="/">
              <Image
                src="/falafel-icon-banner.png"
                width={140}
                height={70}
                alt="FALAFEL icon banner"
                priority
              />
            </Link>
          </div>
          <SidebarGroupLabel className="text-sm font-semibold cursor-default">
            Menu
          </SidebarGroupLabel>
          <SidebarSeparator className="m-1 max-w-[220px]" />
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                if (item.subitems) {
                  return <CollapsibleMenuItem item={item} key={item.title} />;
                } else {
                  return <LinkMenuItem item={item} key={item.title} />;
                }
              })}
              <SidebarGroupLabel className="flex text-sm font-semibold mt-5 group/new cursor-default">
                Courses
                <AddCourseDialog>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className={cn(
                      "ml-auto gap-0 [interpolate-size:allow-keywords] transition-discrete transition-all",
                      "group-hover/new:px-2 group-hover/new:gap-2 group-hover/new:w-fit!"
                    )}
                  >
                    <PlusIcon />
                    <span
                      className={cn(
                        "block w-0 overflow-hidden group-hover/new:w-auto",
                        "[interpolate-size:allow-keywords] transition-discrete transition-all"
                      )}
                    >
                      New
                    </span>
                  </Button>
                </AddCourseDialog>
              </SidebarGroupLabel>
              <SidebarSeparator className="m-1 max-w-[220px]" />
              {courseItems.length > 0 ? (
                courseItems.map((item) => {
                  return <CollapsibleMenuItem item={item} key={item.title} />;
                })
              ) : (
                <p className="falafel-text opacity-60 ml-3">No Courses</p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}

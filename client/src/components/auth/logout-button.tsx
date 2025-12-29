"use client";

import { logout } from "@/actions/auth";
import { doServerAction } from "@/lib/utils.client";
import { LogOutIcon } from "lucide-react";
import { Button } from "../ui/button";

export function LogoutButton() {
  return (
    <Button
      variant="outline"
      onClick={() => {
        localStorage.clear();
        doServerAction(logout());
      }}
    >
      <LogOutIcon />
      Log out
    </Button>
  );
}

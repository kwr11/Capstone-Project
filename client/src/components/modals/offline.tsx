"use client";

import { DialogClose } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export function OfflineDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  function handleChange() {
    setIsDialogOpen(true);
  }

  useEffect(() => {
    window.addEventListener("offline", handleChange);

    return () => {
      window.removeEventListener("offline", handleChange);
    };
  });

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Offline Warning</DialogTitle>
        </DialogHeader>
        <div>
          <p>
            You are offline. If you are not running this program locally, it
            will likely not function anymore. Connect to the internet to
            continue performing actions.
          </p>
        </div>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">OK, Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { initials } from "@/lib/utils";

type Row = {
  fullName: string;
  phoneNumber: string;
  bankName: string;
  displayDate: string;
  registrationTime: string;
};

export function ViewUserDialog({ user }: { user: Row }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="View">
        <Eye className="h-4 w-4" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registration details</DialogTitle>
          <DialogDescription>Full record for this registration.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-4 pb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {initials(user.fullName)}
          </div>
          <div>
            <p className="font-medium">{user.fullName}</p>
            <p className="text-sm text-muted-foreground">{user.bankName}</p>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Phone Number</dt>
            <dd className="mt-1 font-medium">{user.phoneNumber}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Bank Name</dt>
            <dd className="mt-1 font-medium">{user.bankName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Registration Date</dt>
            <dd className="mt-1 font-medium">{user.displayDate}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Registration Time</dt>
            <dd className="mt-1 font-medium">{user.registrationTime}</dd>
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  );
}

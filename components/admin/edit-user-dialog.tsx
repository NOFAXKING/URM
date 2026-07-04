"use client";

import { useEffect, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { updateUserAction, type MutationState } from "@/app/admin/actions";

type Row = {
  id: number;
  fullName: string;
  phoneNumber: string;
  bankName: string;
};

const initialState: MutationState = { success: false, message: "" };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Saving...
        </>
      ) : (
        "Save changes"
      )}
    </Button>
  );
}

export function EditUserDialog({ user }: { user: Row }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(updateUserAction, initialState);

  useEffect(() => {
    if (!state.message) return;
    if (state.success) {
      toast.success(state.message);
      setOpen(false);
    } else if (!state.fieldErrors) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Edit">
        <Pencil className="h-4 w-4" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit registration</DialogTitle>
          <DialogDescription>Update the details for this record.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={user.id} />
          <div className="space-y-2">
            <Label htmlFor={`fullName-${user.id}`}>Russian Full Name</Label>
            <Input id={`fullName-${user.id}`} name="fullName" defaultValue={user.fullName} required />
            {state.fieldErrors?.fullName && (
              <p className="text-sm text-destructive">{state.fieldErrors.fullName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`phoneNumber-${user.id}`}>Phone Number</Label>
            <Input
              id={`phoneNumber-${user.id}`}
              name="phoneNumber"
              defaultValue={user.phoneNumber}
              required
            />
            {state.fieldErrors?.phoneNumber && (
              <p className="text-sm text-destructive">{state.fieldErrors.phoneNumber}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`bankName-${user.id}`}>Bank Name</Label>
            <Input id={`bankName-${user.id}`} name="bankName" defaultValue={user.bankName} required />
            {state.fieldErrors?.bankName && (
              <p className="text-sm text-destructive">{state.fieldErrors.bankName}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SaveButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

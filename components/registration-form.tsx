"use client";

import { useRef, useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser, type RegisterState } from "@/app/actions/register";

const initialState: RegisterState = { success: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Saving...
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" /> Save
        </>
      )}
    </Button>
  );
}

export function RegistrationForm() {
  const [state, formAction] = useActionState(registerUser, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.message) return;
    if (state.success) {
      toast.success("Registration completed successfully.", {
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
      formRef.current?.reset();
    } else if (!state.fieldErrors) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="fullName">Russian Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          placeholder="Иван Петров"
          autoComplete="name"
          required
        />
        {state.fieldErrors?.fullName && (
          <p className="text-sm text-destructive">{state.fieldErrors.fullName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          placeholder="+7 999 123 45 67"
          autoComplete="tel"
          required
        />
        {state.fieldErrors?.phoneNumber && (
          <p className="text-sm text-destructive">{state.fieldErrors.phoneNumber}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bankName">Bank Name</Label>
        <Input id="bankName" name="bankName" placeholder="Sberbank" required />
        {state.fieldErrors?.bankName && (
          <p className="text-sm text-destructive">{state.fieldErrors.bankName}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <SubmitButton />
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => formRef.current?.reset()}
        >
          Clear
        </Button>
      </div>
    </form>
  );
}

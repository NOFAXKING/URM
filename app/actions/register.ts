"use server";

import { prisma } from "@/lib/prisma";
import { registrationSchema } from "@/lib/validations";
import { parsePhoneNumber } from "libphonenumber-js";
import { Prisma } from "@prisma/client";

export type RegisterState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

export async function registerUser(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const raw = {
    fullName: String(formData.get("fullName") ?? ""),
    phoneNumber: String(formData.get("phoneNumber") ?? ""),
    bankName: String(formData.get("bankName") ?? ""),
  };

  const parsed = registrationSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, message: "Please correct the highlighted fields.", fieldErrors };
  }

  // Normalize the phone number to E.164 so duplicate detection is reliable
  // regardless of formatting differences (spaces, dashes, parentheses).
  let normalizedPhone = parsed.data.phoneNumber;
  try {
    const phone = parsePhoneNumber(parsed.data.phoneNumber, "RU");
    if (phone) normalizedPhone = phone.number;
  } catch {
    // fall back to the raw (already-validated) input
  }

  const now = new Date();
  const registrationTime = now.toISOString().slice(11, 16); // HH:mm (UTC)

  try {
    await prisma.user.create({
      data: {
        fullName: parsed.data.fullName,
        phoneNumber: normalizedPhone,
        bankName: parsed.data.bankName,
        registrationDate: now,
        registrationTime,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        success: false,
        message: "This phone number is already registered.",
        fieldErrors: { phoneNumber: "This phone number is already registered." },
      };
    }
    console.error("Registration failed:", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }

  return { success: true, message: "Registration completed successfully." };
}

"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateUserSchema } from "@/lib/validations";
import { parsePhoneNumber } from "libphonenumber-js";
import { Prisma } from "@prisma/client";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export type MutationState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

export async function updateUserAction(
  _prevState: MutationState,
  formData: FormData
): Promise<MutationState> {
  await requireAdmin();

  const raw = {
    id: Number(formData.get("id")),
    fullName: String(formData.get("fullName") ?? ""),
    phoneNumber: String(formData.get("phoneNumber") ?? ""),
    bankName: String(formData.get("bankName") ?? ""),
  };

  const parsed = updateUserSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, message: "Please correct the highlighted fields.", fieldErrors };
  }

  let normalizedPhone = parsed.data.phoneNumber;
  try {
    const phone = parsePhoneNumber(parsed.data.phoneNumber, "RU");
    if (phone) normalizedPhone = phone.number;
  } catch {
    // keep raw
  }

  try {
    await prisma.user.update({
      where: { id: parsed.data.id },
      data: {
        fullName: parsed.data.fullName,
        phoneNumber: normalizedPhone,
        bankName: parsed.data.bankName,
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
    console.error("Update failed:", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin");
  return { success: true, message: "User updated successfully." };
}

export async function deleteUserAction(id: number): Promise<MutationState> {
  await requireAdmin();

  try {
    await prisma.user.delete({ where: { id } });
  } catch (error) {
    console.error("Delete failed:", error);
    return { success: false, message: "Could not delete this record." };
  }

  revalidatePath("/admin");
  return { success: true, message: "User deleted successfully." };
}

import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

// Cyrillic-only full name validator (Russian Full Name), 2-3 words, letters + hyphens.
const russianNameRegex = /^[А-Яа-яЁё\s-]+$/;

export const registrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(120, "Full name is too long")
    .regex(russianNameRegex, "Full name must be in Russian (Cyrillic letters only)"),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .refine((val) => isValidPhoneNumber(val, "RU") || isValidPhoneNumber(val), {
      message: "Enter a valid phone number",
    }),
  bankName: z
    .string()
    .trim()
    .min(1, "Bank name is required")
    .max(120, "Bank name is too long"),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const updateUserSchema = registrationSchema.extend({
  id: z.number().int().positive(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

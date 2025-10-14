import { z } from "zod";

export const signinSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Enter an email" })
    .email({ message: "Email is not valid" }),
  password: z.string().min(1, {
    message: "Enter a password",
  }),
});
export const signupSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Enter an email" })
    .email({ message: "Email is not valid" }),
  name: z.string().min(1, { message: "Enter a name" }),
  phoneNumber: z.string().min(1, { message: "Enter a phone number" }),
  password: z
    .string()
    .min(8, {
      message: "Password length must contain at least 8 characters",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[!@#$%^&*?]/, {
      message:
        "Password must contain at least one unique character (e.g: !@#$%^&*?)",
    }),
});

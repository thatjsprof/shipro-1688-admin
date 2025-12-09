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

export const changeSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Enter a current password" }),
    password: z
      .string()
      .min(1, { message: "Enter a password" })
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, { message: "Enter a confirm password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Enter an email" })
    .email({ message: "Email is not valid" }),
  name: z.string().min(1, { message: "Enter a name" }),
  phoneNumber: z.string().min(1, { message: "Enter a phone number" }),
  country: z.string().min(1, { message: "Enter a country" }),
});

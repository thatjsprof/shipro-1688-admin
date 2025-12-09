import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/toast";
import { changeSchema } from "@/schemas/auth";
import { useChangePasswordMutation } from "@/services/user.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const Password = () => {
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState<boolean>(false);
  const [showCur, setShowCur] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const form = useForm<z.infer<typeof changeSchema>>({
    resolver: zodResolver(changeSchema),
    mode: "onSubmit",
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });
  const {
    formState: { errors },
  } = form;
  const handleSubmit = async (v: z.infer<typeof changeSchema>) => {
    try {
      setError(null);
      const res = await changePassword({
        currentPassword: v.currentPassword,
        newPassword: v.password,
      }).unwrap();
      if (res.user) {
        notify("Password changed successfully", "success");
        form.reset();
      }
    } catch (err: any) {
      const error: {
        message: string;
        code: string;
      } = err?.data;
      if (["PASSWORD_NOT_PRESENT", "INVALID_PASSWORD"].includes(error?.code)) {
        setError(error?.message);
      }
    }
  };

  return (
    <div className="mt-6 max-w-xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="col-span-5">
          <div className="flex flex-col gap-6">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => {
                return (
                  <FormItem className="space-y-1">
                    <FormLabel htmlFor="currentPassword">
                      Current Password
                    </FormLabel>
                    <div className="flex flex-col space-y-1">
                      <FormControl>
                        <Input
                          {...field}
                          id="currentPassword"
                          placeholder="**************"
                          className="bg-transparent"
                          error={!!errors?.currentPassword}
                          type={showCur ? "text" : "password"}
                          onChange={(e) => {
                            field.onChange(e);
                            setError(null);
                          }}
                          onBlur={() => {
                            setError(null);
                            field.onBlur();
                          }}
                          EndIcon={
                            <div
                              onClick={() => setShowCur((prev) => !prev)}
                              className="cursor-pointer text-zinc-500"
                            >
                              {showCur ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </div>
                          }
                        />
                      </FormControl>
                      {error ? (
                        <FormDescription className="text-[.8rem] m-0 p-0 text-destructive">
                          {error}
                        </FormDescription>
                      ) : (
                        <FormDescription className="text-[.8rem] m-0 p-0 text-gray-500">
                          Leave blank if this is the first time you are setting
                          a password.
                        </FormDescription>
                      )}
                    </div>
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => {
                return (
                  <FormItem className="space-y-1">
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <div className="flex flex-col space-y-1">
                      <FormControl>
                        <Input
                          {...field}
                          id="password"
                          placeholder="**************"
                          className="bg-transparent"
                          error={!!errors?.password}
                          type={show ? "text" : "password"}
                          EndIcon={
                            <div
                              onClick={() => setShow((prev) => !prev)}
                              className="cursor-pointer text-zinc-500"
                            >
                              {show ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </div>
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => {
                return (
                  <FormItem className="space-y-1">
                    <FormLabel htmlFor="confirmPassword">
                      Confirm Password
                    </FormLabel>
                    <div className="flex flex-col space-y-1">
                      <FormControl>
                        <Input
                          {...field}
                          id="confirmPassword"
                          placeholder="**************"
                          className="bg-transparent"
                          error={!!errors?.confirmPassword}
                          type={showConfirm ? "text" : "password"}
                          EndIcon={
                            <div
                              onClick={() => setShowConfirm((prev) => !prev)}
                              className="cursor-pointer text-zinc-500"
                            >
                              {showConfirm ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </div>
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                );
              }}
            />
          </div>
          <div className="mt-10">
            <Button
              className="h-12 px-5 font-semibold"
              disabled={isLoading}
              type="submit"
            >
              {isLoading && <Icons.spinner className="h-3 w-3 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Password;

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { signinSchema } from "../../schemas/auth";
import { useGetOauthMutation, useLoginMutation } from "@/services/user.service";
import { notify } from "@/lib/toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { GoogleLoginButton } from "@/components/ui/google-login-button";

const Login = () => {
  const [show, setShow] = useState<boolean>(false);
  const [login, { isLoading }] = useLoginMutation();
  const [oauth, { isLoading: isLoadingAuth }] = useGetOauthMutation();
  const router = useRouter();

  const form = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    formState: { errors },
  } = form;

  const handleSubmit = async (data: z.infer<typeof signinSchema>) => {
    try {
      const response = await login(data).unwrap();
      if (response.token) {
        notify("Logged in successfully", "success");
        router.push("/dashboard");
      }
    } catch (err: any) {
      const error = err.data;
      if (error?.message) notify(error.message, "error");
      else notify("Sorry, we could not log you in", "error");
    }
  };

  const handleGoogleClick = async () => {
    const { url } = await oauth({
      provider: "google",
      callbackURL: "http://localhost:3000/dashboard",
    }).unwrap();
    if (url) {
      window.location.replace(url);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-screen items-center justify-center">
      <Link href="/" className="flex justify-center mb-10">
        <img src="/logo-2.png" className="w-[10rem] h-auto" />
      </Link>
      <div className="p-0 max-w-md mx-auto w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <div className="flex flex-col space-y-1">
                          <FormControl>
                            <Input
                              {...field}
                              id="email"
                              placeholder="m@example.com"
                              error={!!errors?.email}
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
                  name="password"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel htmlFor="password">Password</FormLabel>
                          <Link
                            href="/forgot-password"
                            className="ml-auto text-muted-foreground text-xs underline-offset-2 hover:underline"
                          >
                            Forgot your password?
                          </Link>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <FormControl>
                            <Input
                              {...field}
                              id="password"
                              placeholder="**************"
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
              </div>
              <Button
                type="submit"
                disabled={isLoading || isLoadingAuth}
                className="w-full h-11 shadow-none font-semibold mt-2"
              >
                {(isLoading || isLoadingAuth) && (
                  <Icons.spinner className="h-3 w-3 animate-spin" />
                )}
                Login
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Login;

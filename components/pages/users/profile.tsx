import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import PhoneNumberInput from "@/components/ui/phone";
import { Skeleton } from "@/components/ui/skeleton";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { adminSetPasswordSchema, profileSchema } from "@/schemas/auth";
import {
  useAdminSetUserPasswordMutation,
  useAdminUpdateUserMutation,
  useGetAdminUserQuery,
} from "@/services/user.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Country } from "shipro-country-state-city";
import { z } from "zod";

const resolveCountryIso = (country?: string | null) => {
  if (!country) return "NG";
  const countries = Country.getAllCountries();
  const byIso = countries.find(
    (c) => c.isoCode.toLowerCase() === country.toLowerCase()
  );
  if (byIso) return byIso.isoCode;
  const byName = countries.find(
    (c) => c.name.toLowerCase() === country.toLowerCase()
  );
  return byName?.isoCode ?? "NG";
};

const Profile = () => {
  const router = useRouter();
  const userId = router.query.id as string;
  const { data: user, isLoading, isError } = useGetAdminUserQuery(userId, {
    skip: !userId,
  });
  const [updateUser, { isLoading: isUpdating }] = useAdminUpdateUserMutation();
  const [setPassword, { isLoading: isSettingPassword }] =
    useAdminSetUserPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const countries = useMemo(
    () =>
      Country.getAllCountries().map((country) => ({
        value: country.isoCode,
        label: country.name,
        flag: country.flag,
      })),
    []
  );

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      name: "",
      phoneNumber: "",
      country: "NG",
    },
  });

  const passwordForm = useForm<z.infer<typeof adminSetPasswordSchema>>({
    resolver: zodResolver(adminSetPasswordSchema),
    mode: "onSubmit",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    profileForm.reset({
      email: user.email ?? "",
      name: user.name ?? "",
      phoneNumber: user.phoneNumber ?? "",
      country: resolveCountryIso(user.country),
    });
  }, [user, profileForm]);

  const {
    formState: { errors: profileErrors },
  } = profileForm;
  const {
    formState: { errors: passwordErrors },
  } = passwordForm;

  const handleProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    if (!userId) return;
    try {
      const countryLabel =
        countries.find((c) => c.value === data.country)?.label ?? data.country;
      await updateUser({
        userId,
        data: {
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          country: countryLabel,
        },
      }).unwrap();
      notify("User updated successfully", "success");
    } catch (err: any) {
      notify(err?.data?.message || "User could not be updated", "error");
    }
  };

  const handlePasswordSubmit = async (
    data: z.infer<typeof adminSetPasswordSchema>
  ) => {
    if (!userId) return;
    try {
      const res = await setPassword({
        userId,
        newPassword: data.password,
      }).unwrap();
      if (res?.status !== false) {
        notify("Password updated successfully", "success");
        passwordForm.reset();
      } else {
        notify("Password could not be updated", "error");
      }
    } catch (err: any) {
      notify(err?.data?.message || "Password could not be updated", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="mt-6 max-w-xl flex flex-col gap-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="py-6 text-sm text-muted-foreground">
        Unable to load this user.
      </div>
    );
  }

  return (
    <div className="mt-6 max-w-xl flex flex-col gap-12">
      <div>
        <h2 className="text-lg font-semibold mb-6">Profile</h2>
        <Form {...profileForm}>
          <form
            onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
            id="admin-user-profile-form"
          >
            <div className="flex flex-col gap-5">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="admin-user-name">Name</FormLabel>
                    <div className="flex flex-col space-y-1">
                      <FormControl>
                        <Input
                          {...field}
                          id="admin-user-name"
                          className="bg-transparent"
                          placeholder="John Doe"
                          error={!!profileErrors?.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="admin-user-email">Email</FormLabel>
                    <div className="flex flex-col space-y-1">
                      <FormControl>
                        <Input
                          {...field}
                          id="admin-user-email"
                          className="bg-transparent"
                          placeholder="m@example.com"
                          error={!!profileErrors?.email}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="admin-user-phone">
                      Phone Number
                    </FormLabel>
                    <div className="flex flex-col space-y-1">
                      <FormControl>
                        <PhoneNumberInput
                          {...field}
                          id="admin-user-phone"
                          country="NG"
                          className="bg-transparent"
                          placeholder="Enter phone number"
                          error={!!profileErrors?.phoneNumber}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Country</FormLabel>
                    <div className="flex flex-col space-y-1">
                      <FormControl>
                        <Combobox<{
                          value: string;
                          label: string;
                          flag: string;
                        }>
                          isModal={false}
                          items={countries}
                          externalValue={field.value}
                          lowercaseVal={false}
                          handleReceiveValue={(value) => {
                            field.onChange(value);
                          }}
                          filterFunction={(value, search) => {
                            const country = countries.find(
                              (c) => c.value === value
                            );
                            if (!country) return 0;
                            return country.label
                              .toLowerCase()
                              .includes(search.toLowerCase())
                              ? 1
                              : 0;
                          }}
                          buttonProps={{
                            ...field,
                            className:
                              "h-11 px-3 w-full justify-between !bg-transparent !pointer-events-auto",
                          }}
                          searchPlaceholder="Select country"
                          error={!!profileErrors.country}
                          renderProp={({ item, value }) => (
                            <>
                              <span>{item.flag}</span>
                              <span className="inline-block ml-[.4rem]">
                                {item.label}
                              </span>
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  value === item.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </>
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-8">
              <Button
                className="font-semibold px-5 h-12"
                type="submit"
                form="admin-user-profile-form"
                disabled={isUpdating}
              >
                {isUpdating && (
                  <Icons.spinner className="h-3 w-3 animate-spin" />
                )}
                Save Profile
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-6">Password</h2>
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
            <div className="flex flex-col gap-5">
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel htmlFor="admin-user-password">
                      New Password
                    </FormLabel>
                    <div className="flex flex-col space-y-1">
                      <FormControl>
                        <Input
                          {...field}
                          id="admin-user-password"
                          placeholder="**************"
                          className="bg-transparent"
                          error={!!passwordErrors?.password}
                          type={showPassword ? "text" : "password"}
                          EndIcon={
                            <div
                              onClick={() => setShowPassword((prev) => !prev)}
                              className="cursor-pointer text-zinc-500"
                            >
                              {showPassword ? (
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
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel htmlFor="admin-user-confirm-password">
                      Confirm Password
                    </FormLabel>
                    <div className="flex flex-col space-y-1">
                      <FormControl>
                        <Input
                          {...field}
                          id="admin-user-confirm-password"
                          placeholder="**************"
                          className="bg-transparent"
                          error={!!passwordErrors?.confirmPassword}
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
                )}
              />
            </div>
            <div className="mt-8">
              <Button
                className="h-12 px-5 font-semibold"
                disabled={isSettingPassword}
                type="submit"
              >
                {isSettingPassword && (
                  <Icons.spinner className="h-3 w-3 animate-spin" />
                )}
                Update Password
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Profile;

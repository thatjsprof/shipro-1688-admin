import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
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
import PhoneNumberInput from "@/components/ui/phone";
import { profileSchema } from "@/schemas/auth";
import {
  useLazyGetProfileQuery,
  useUpdateMutation,
} from "@/services/user.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Country } from "shipro-country-state-city";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/toast";
import { setAuthenticationState } from "@/store/user";
import { Icons } from "@/components/shared/icons";

const Account = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const [updateProfile, { isLoading }] = useUpdateMutation();
  const [getUser] = useLazyGetProfileQuery();

  const countries = useMemo(
    () =>
      Country.getAllCountries().map((country) => {
        return {
          value: country.isoCode,
          label: country.name,
          flag: country.flag,
        };
      }),
    []
  );

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      name: "",
      phoneNumber: "",
      country: "NG",
    },
    values: {
      email: user?.email ?? "",
      name: user?.name ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      country: "NG",
    },
  });

  const {
    formState: { errors },
  } = form;

  const handleSubmit = async (data: z.infer<typeof profileSchema>) => {
    const response = await updateProfile({
      name: data.name,
      phoneNumber: data.phoneNumber,
    }).unwrap();
    if (response.status) {
      // TODO: Probably a better way to do this...
      const res = await getUser().unwrap();
      const data = res.user;
      dispatch(
        setAuthenticationState({
          authenticated: true,
          user: data,
        })
      );
      notify("Profile updated successfully", "success");
    } else {
      notify("Profile could not be updated", "error");
    }
  };

  return (
    <div className="mt-6 max-w-xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} id="account-form">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel htmlFor="name">Name</FormLabel>
                      <div className="flex flex-col space-y-1">
                        <FormControl>
                          <Input
                            {...field}
                            id="name"
                            className="bg-transparent"
                            placeholder="John Doe"
                            error={!!errors?.name}
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
                            disabled
                            className="bg-transparent"
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
                name="phoneNumber"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel htmlFor="phoneNumber">
                        Whatsapp Number
                      </FormLabel>
                      <div className="flex flex-col space-y-1">
                        <FormControl>
                          <PhoneNumberInput
                            {...field}
                            id="phoneNumber"
                            country="NG"
                            className="bg-transparent"
                            placeholder="Enter your whatsapp number"
                            error={!!errors?.phoneNumber}
                          />
                        </FormControl>
                        {!!!errors.phoneNumber && (
                          <FormDescription className="text-xs text-gray-500">
                            IMPORTANT: We will use this number to communicate
                            with you
                          </FormDescription>
                        )}
                        <FormMessage />
                      </div>
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
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
                            disabled: true,
                            className:
                              "h-11 px-3 w-full justify-between !bg-transparent !pointer-events-auto",
                          }}
                          searchPlaceholder="Select country"
                          error={!!errors.country}
                          renderProp={({ item, value }) => {
                            return (
                              <>
                                <span>{item.flag}</span>
                                <span className="inline-block ml-[.4rem]">
                                  {item.label}
                                </span>
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    value === item.value.toLowerCase()
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </>
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="mt-10">
            <Button
              className="font-semibold px-5 h-12"
              type="submit"
              form="account-form"
              disabled={isLoading}
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

export default Account;

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Combobox, IItem } from "@/components/ui/combobox";
import { Icons } from "@/components/shared/icons";
import {
  CreateDiscountPayload,
  DiscountRule,
  IDiscount,
  IDiscountUser,
  UpdateDiscountPayload,
} from "@/interfaces/discount.interface";
import { notify } from "@/lib/toast";
import {
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
} from "@/services/management.service";
import { useLazyGetUsersQuery } from "@/services/user.service";
import debounce from "lodash.debounce";
import { useEffect, useMemo, useState } from "react";

const RULE_OPTIONS: { value: DiscountRule; label: string; hint: string }[] = [
  {
    value: DiscountRule.ONE_PER_USER,
    label: "Once per user",
    hint: "Each customer can redeem this code once",
  },
  {
    value: DiscountRule.MULTIPLE_PER_USER,
    label: "Multiple per user",
    hint: "Customers can reuse until global limits apply",
  },
  {
    value: DiscountRule.SINGLE_USE,
    label: "Single use total",
    hint: "Only one redemption across all customers",
  },
  {
    value: DiscountRule.PUBLIC,
    label: "Public (unlimited per user)",
    hint: "Same as multiple per user",
  },
];

type FormState = {
  title: string;
  description: string;
  percentage: string;
  rule: DiscountRule;
  active: boolean;
  global: boolean;
  userIds: string[];
  maxRedemptions: string;
  maxRedemptionsPerUser: string;
  startsAt: string;
  expiresAt: string;
};

const emptyForm = (): FormState => ({
  title: "",
  description: "",
  percentage: "",
  rule: DiscountRule.ONE_PER_USER,
  active: true,
  global: true,
  userIds: [],
  maxRedemptions: "",
  maxRedemptionsPerUser: "",
  startsAt: "",
  expiresAt: "",
});

const toLocalInput = (value?: string | null) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

const parseOptionalInt = (value: string) => {
  if (!value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discount?: IDiscount | null;
};

const DiscountDialog = ({ open, onOpenChange, discount }: Props) => {
  const isEdit = Boolean(discount);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [selectedUsers, setSelectedUsers] = useState<IDiscountUser[]>([]);
  const [createDiscount, { isLoading: creating }] = useCreateDiscountMutation();
  const [updateDiscount, { isLoading: updating }] = useUpdateDiscountMutation();
  const [searchUsers, { data: usersData, isFetching: searchingUsers }] =
    useLazyGetUsersQuery();

  const loading = creating || updating;

  const users = usersData?.data?.data ?? [];
  const userOptions = useMemo<IItem[]>(() => {
    const byId = new Map<string, IDiscountUser>();
    selectedUsers.forEach((user) => byId.set(user.id, user));
    users.forEach((user) => byId.set(user.id, user));
    return Array.from(byId.values()).map((user) => ({
      value: user.id,
      label: `${user.name || "Unnamed user"} · ${user.email}`,
    }));
  }, [selectedUsers, users]);

  const debouncedSearch = useMemo(
    () =>
      debounce((q: string) => {
        const search = q.trim();
        if (search.length < 2) return;
        searchUsers({ page: 0, limit: 20, search });
      }, 350),
    [searchUsers]
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  useEffect(() => {
    if (!open) return;
    if (discount) {
      const scopedUsers = discount.users?.length
        ? discount.users
        : discount.user
        ? [discount.user]
        : [];
      setForm({
        title: discount.title,
        description: discount.description ?? "",
        percentage: String(discount.percentage ?? ""),
        rule: discount.rule,
        active: discount.active,
        global: discount.global,
        userIds: scopedUsers.map((user) => user.id),
        maxRedemptions:
          discount.maxRedemptions != null ? String(discount.maxRedemptions) : "",
        maxRedemptionsPerUser:
          discount.maxRedemptionsPerUser != null
            ? String(discount.maxRedemptionsPerUser)
            : "",
        startsAt: toLocalInput(discount.startsAt),
        expiresAt: toLocalInput(discount.expiresAt),
      });
      setSelectedUsers(scopedUsers);
    } else {
      setForm(emptyForm());
      setSelectedUsers([]);
    }
  }, [open, discount]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildPayload = (): CreateDiscountPayload | UpdateDiscountPayload => {
    const base = {
      description: form.description.trim(),
      percentage: Number(form.percentage),
      rule: form.rule,
      active: form.active,
      global: form.global,
      userId: null,
      userIds: form.global ? [] : form.userIds,
      maxRedemptions:
        form.rule === DiscountRule.SINGLE_USE
          ? 1
          : parseOptionalInt(form.maxRedemptions),
      maxRedemptionsPerUser: parseOptionalInt(form.maxRedemptionsPerUser),
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    };
    if (isEdit) return base;
    return {
      ...base,
      title: form.title.trim().toUpperCase(),
    };
  };

  const handleSubmit = async () => {
    if (!isEdit && form.title.trim().length < 2) {
      notify("Enter a discount code (at least 2 characters)");
      return;
    }
    const percentage = Number(form.percentage);
    if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
      notify("Percentage must be between 0.01 and 100");
      return;
    }
    if (!form.global && form.userIds.length === 0) {
      notify("Select at least one user for scoped discounts");
      return;
    }

    try {
      if (isEdit && discount) {
        const response = await updateDiscount({
          id: discount.id,
          body: buildPayload() as UpdateDiscountPayload,
        }).unwrap();
        notify(response.message || "Discount updated");
      } else {
        const response = await createDiscount(
          buildPayload() as CreateDiscountPayload
        ).unwrap();
        notify(response.message || "Discount created");
      }
      onOpenChange(false);
    } catch (err: any) {
      notify(err?.data?.message || "Failed to save discount");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit discount" : "Create discount"}</DialogTitle>
          <DialogDescription>
            Set redemption rules, expiry, and optional user scope.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="discount-code">Code</Label>
            <Input
              id="discount-code"
              value={form.title}
              disabled={isEdit}
              onChange={(e) => setField("title", e.target.value.toUpperCase())}
              placeholder="WELCOME10"
              className="uppercase"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="discount-desc">Description</Label>
            <Textarea
              id="discount-desc"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Optional internal note"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="discount-pct">Percentage (%)</Label>
              <Input
                id="discount-pct"
                type="number"
                min={0.01}
                max={100}
                step="0.01"
                value={form.percentage}
                onChange={(e) => setField("percentage", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Rule</Label>
              <Select
                value={form.rule}
                onValueChange={(v) => setField("rule", v as DiscountRule)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RULE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            {RULE_OPTIONS.find((r) => r.value === form.rule)?.hint}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="max-redemptions">Max redemptions</Label>
              <Input
                id="max-redemptions"
                type="number"
                min={1}
                disabled={form.rule === DiscountRule.SINGLE_USE}
                value={
                  form.rule === DiscountRule.SINGLE_USE
                    ? "1"
                    : form.maxRedemptions
                }
                onChange={(e) => setField("maxRedemptions", e.target.value)}
                placeholder="Unlimited"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="max-per-user">Max per user</Label>
              <Input
                id="max-per-user"
                type="number"
                min={1}
                value={form.maxRedemptionsPerUser}
                onChange={(e) =>
                  setField("maxRedemptionsPerUser", e.target.value)
                }
                placeholder="From rule"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="starts-at">Starts at</Label>
              <Input
                id="starts-at"
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setField("startsAt", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expires-at">Expires at</Label>
              <Input
                id="expires-at"
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setField("expiresAt", e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">
                Inactive codes cannot be applied
              </p>
            </div>
            <Switch
              checked={form.active}
              onCheckedChange={(v) => setField("active", v)}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Available to everyone</p>
              <p className="text-xs text-muted-foreground">
                Turn off to scope to selected users
              </p>
            </div>
            <Switch
              checked={form.global}
              onCheckedChange={(v) => {
                setField("global", v);
                if (v) {
                  setField("userIds", []);
                  setSelectedUsers([]);
                }
              }}
            />
          </div>

          {!form.global && (
            <div className="grid gap-2">
              <Label>Scoped users</Label>
              <Combobox
                multiple
                isModal
                lowercaseVal={false}
                items={userOptions}
                externalValue={form.userIds}
                searchPlaceholder="Search users by name or email"
                emptyPlaceholder={
                  searchingUsers
                    ? "Searching…"
                    : "Type at least 2 characters to search"
                }
                handleInputChange={debouncedSearch}
                handleReceiveValue={(value) => {
                  const userIds = Array.isArray(value) ? value : [];
                  setField("userIds", userIds);
                  setSelectedUsers((current) => {
                    const available = new Map(
                      [...current, ...users].map((user) => [user.id, user])
                    );
                    return userIds
                      .map((id) => available.get(id))
                      .filter((user): user is IDiscountUser => Boolean(user));
                  });
                }}
                buttonProps={{ className: "min-h-11" }}
                popoverCls="w-[var(--radix-popover-trigger-width)]"
              />
              <p className="text-xs text-muted-foreground">
                Search runs on the server and returns up to 20 matches.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Save changes" : "Create discount"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DiscountDialog;

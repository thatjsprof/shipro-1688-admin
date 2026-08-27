import AdvancedPagination from "@/components/ui/advanced-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/shared/icons";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { IUser, IUserRole } from "@/interfaces/user.interface";
import useCopy, { ICopy } from "@/lib/copy";
import { notify } from "@/lib/toast";
import {
  useGetUsersQuery,
  useLazyGetUsersQuery,
  useResendVerificationMutation,
} from "@/services/user.service";
import { useAppSelector } from "@/store/hooks";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { format } from "date-fns";
import debounce from "lodash.debounce";
import { Copy, Download, Mail, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";

const escapeCsvValue = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const downloadCsv = (filename: string, rows: string[][]) => {
  const csv = rows
    .map((row) => row.map((cell) => escapeCsvValue(cell ?? "")).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const formatUserDate = (value?: string | Date) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "dd MMM, yyy, h:mm a");
};

const usersToTableRows = (users: IUser[]): string[][] => {
  return [
    [
      "Name",
      "Email",
      "Phone Number",
      "Cart",
      "Date Joined",
      "Verification Status",
    ],
    ...users.map((user) => [
      user.name ?? "",
      user.email ?? "",
      user.phoneNumber ?? "",
      String(user.cartCount ?? 0),
      formatUserDate(user.createdAt),
      user.emailVerified ? "Verified" : "Not Verified",
    ]),
  ];
};

const usersToEmailRows = (users: IUser[]): string[][] => {
  return [["Email"], ...users.map((user) => [user.email ?? ""])];
};

const isUnverified = (user: IUser) => !user.emailVerified;

const getColumns = (
  copyToClipboard: ({ id, text, message, style }: ICopy) => void,
  onResendVerification: (user: IUser) => void,
  isResending: boolean
): ColumnDef<IUser>[] => {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Name"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const name = row.original.name;
        const isAdmin = row.original.role === IUserRole.admin;
        return (
          <div className="flex items-center gap-[0.7rem] text-nowrap h-8 mb-1">
            <Copy
              className="size-4 text-gray-600"
              onClick={(e) => {
                copyToClipboard({
                  id: "copy-name",
                  text: name,
                  message: "Name copied to clipboard",
                });
                e.preventDefault();
                e.stopPropagation();
              }}
            />
            <p>{name}</p>
            {isAdmin && (
              <Badge className="h-6 rounded-full bg-primary px-2.5 text-[.75rem] font-medium text-white">
                Admin
              </Badge>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Email"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const email = row.original.email;
        return (
          <div className="flex items-center gap-[0.7rem] text-nowrap h-8 mb-1">
            <Copy
              className="size-4 text-gray-600"
              onClick={(e) => {
                copyToClipboard({
                  id: "copy-email",
                  text: email,
                  message: "Email copied to clipboard",
                });
                e.preventDefault();
                e.stopPropagation();
              }}
            />
            <p>{email}</p>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "phoneNumber",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Phone Number"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const phoneNumber = row.original.phoneNumber;
        return (
          <div className="flex items-center gap-[0.7rem] text-nowrap h-8 mb-1">
            <Copy
              className="size-4 text-gray-600"
              onClick={(e) => {
                copyToClipboard({
                  id: "copy-phone",
                  text: phoneNumber,
                  message: "Phone number copied to clipboard",
                });
                e.preventDefault();
                e.stopPropagation();
              }}
            />
            {phoneNumber ? <p className="mb-1">{phoneNumber}</p> : <p>---</p>}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "cartCount",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Cart"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const cartCount = row.original.cartCount ?? 0;
        return (
          <div>
            <p className="mb-1">{cartCount}</p>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <DataTableColumnHeader
            column={column}
            title="Date Joined"
            className="-mb-[1.8px] px-2"
          />
        );
      },
      cell: ({ row }) => {
        const createdAt = row.getValue<Date>("createdAt");
        return (
          <div className="flex items-center gap-[0.9rem] text-nowrap">
            {createdAt ? format(createdAt, "dd MMM, yyy, h:mm a") : "---"}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "emailVerified",
      header: ({ column }) => {
        return (
          <DataTableColumnHeader
            column={column}
            title="Verification Status"
            className="-mb-[1.8px] px-2"
          />
        );
      },
      cell: ({ row }) => {
        const emailVerified = row.getValue<Date>("emailVerified");
        return (
          <div className="flex items-center gap-[0.9rem] text-nowrap !text-[.9rem] font-medium">
            {emailVerified ? (
              <Badge className="h-8 rounded-full bg-green-500 px-3 text-[.85rem] font-medium">
                Verified
              </Badge>
            ) : (
              <Badge className="h-8 rounded-full bg-red-500 px-3 text-[.85rem] font-medium">
                Not Verified
              </Badge>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title=""
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        if (!isUnverified(row.original)) return null;
        return (
          <div
            className="flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="outline"
              className="shadow-none"
              disabled={isResending}
              onClick={() => onResendVerification(row.original)}
            >
              <Mail className="h-4 w-4" />
              Resend verification
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
};

const Users = () => {
  const router = useRouter();
  const { copyToClipboard } = useCopy();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [rowSelect, setRowSelect] = useState<Record<string, boolean>>({});
  const [rowSelection, setRowSelection] = useState<IUser[]>([]);
  const authenticated = useAppSelector((state) => state.user.authenticated);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 20,
  });
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );
  const { data, isLoading } = useGetUsersQuery(
    {
      page: pageIndex - 1,
      limit: pageSize,
      search: debouncedValue,
    },
    {
      skip: !authenticated,
    }
  );
  const [getUsers] = useLazyGetUsersQuery();
  const [resendVerification, { isLoading: isResending }] =
    useResendVerificationMutation();
  const users = data?.data.data ?? [];
  const totalPages = data?.data.totalPages ?? 0;
  const totalCount = data?.data.totalCount ?? 0;
  const hasSelected = rowSelection.length > 0;
  const unverifiedSelected = useMemo(
    () => rowSelection.filter(isUnverified),
    [rowSelection]
  );

  const handleResendVerification = useCallback(
    async (usersToEmail: IUser[]) => {
      const userIds = usersToEmail.filter(isUnverified).map((user) => user.id);
      if (userIds.length === 0) {
        notify("Select at least one unverified user");
        return;
      }
      try {
        const res = await resendVerification({ userIds }).unwrap();
        const { sent, skipped, failed } = res.data;
        if (sent > 0) {
          const sentLabel =
            sent === 1
              ? "Verification email sent"
              : `Sent verification emails to ${sent} users`;
          const skipLabel =
            skipped > 0
              ? ` Skipped ${skipped} already verified.`
              : "";
          notify(`${sentLabel}.${skipLabel}`, "success");
        } else if (skipped > 0 && failed.length === 0) {
          notify("Selected users are already verified");
        }
        if (failed.length > 0) {
          notify(
            `Failed to send to ${failed.length} user${failed.length === 1 ? "" : "s"}`,
            "error"
          );
        }
      } catch {
        notify("Failed to send verification email", "error");
      }
    },
    [resendVerification]
  );

  const columns = getColumns(
    copyToClipboard,
    (user) => {
      void handleResendVerification([user]);
    },
    isResending
  );

  const getRowId = useCallback((row: IUser) => row.id, []);

  const clearState = () => {
    setRowSelection([]);
    setRowSelect({});
  };

  const resolveUsers = async (scope: "all" | "selected") => {
    if (scope === "selected") return rowSelection;
    const res = await getUsers({
      page: 0,
      noLimit: true,
      search: debouncedValue || undefined,
    }).unwrap();
    return res?.data?.data ?? [];
  };

  const handleExport = async (
    kind: "table" | "emails",
    scope: "all" | "selected"
  ) => {
    if (scope === "selected" && rowSelection.length === 0) {
      notify("Select at least one user to export");
      return;
    }
    setIsExporting(true);
    try {
      const list = await resolveUsers(scope);
      if (list.length === 0) {
        notify("No users to export");
        return;
      }
      const stamp = format(new Date(), "yyyy-MM-dd");
      const suffix = scope === "selected" ? "selected" : "all";
      if (kind === "emails") {
        downloadCsv(
          `shipro-users-emails-${suffix}-${stamp}.csv`,
          usersToEmailRows(list)
        );
      } else {
        downloadCsv(
          `shipro-users-${suffix}-${stamp}.csv`,
          usersToTableRows(list)
        );
      }
      notify("Users exported", "success");
    } catch {
      notify("Failed to export users", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const debouncedChangeHandler = useCallback(
    debounce((value) => {
      setDebouncedValue(value);
      setPagination((prev) => ({
        ...prev,
        pageIndex: 1,
      }));
    }, 300),
    []
  );
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchValue(value);
    debouncedChangeHandler(value);
  };

  const handleClearSearch = () => {
    setDebouncedValue("");
    setSearchValue("");
  };

  useEffect(() => {
    document.title = `Users | Shipro Africa`;
  }, []);

  return (
    <div className="mt-7">
      <div className="flex items-center gap-3 justify-between">
        <Input
          value={searchValue}
          onChange={handleChange}
          placeholder="Search User(s)"
          className="h-11 pl-[3rem] !text-[1rem] placeholder:text-[.95rem]"
          StartIcon={<Search className="ml-2 text-gray-400 h-4 w-4" />}
          EndIcon={
            searchValue ? (
              <X
                className="text-gray-400 -mr-[.1rem] h-4 w-4 cursor-pointer"
                onClick={handleClearSearch}
              />
            ) : null
          }
        />
        <div className="flex items-center gap-2">
          {hasSelected && (
            <Button
              type="button"
              variant="outline"
              className="shadow-none h-11"
              disabled={isResending || unverifiedSelected.length === 0}
              onClick={() => handleResendVerification(rowSelection)}
            >
              {isResending ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Resend verification
              {unverifiedSelected.length > 0
                ? ` (${unverifiedSelected.length})`
                : ""}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="shadow-none h-11"
                disabled={isExporting}
              >
                {isExporting ? (
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Full list</DropdownMenuLabel>
              <DropdownMenuItem
                disabled={isExporting}
                onClick={() => handleExport("table", "all")}
              >
                All users
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isExporting || !hasSelected}
                onClick={() => handleExport("table", "selected")}
              >
                Selected users
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Emails only</DropdownMenuLabel>
              <DropdownMenuItem
                disabled={isExporting}
                onClick={() => handleExport("emails", "all")}
              >
                All emails
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isExporting || !hasSelected}
                onClick={() => handleExport("emails", "selected")}
              >
                Selected emails
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/users/new">
            <Button className="shadow-none h-11">Create New</Button>
          </Link>
        </div>
      </div>
      {hasSelected && (
        <div className="flex items-center gap-2 mt-4">
          <p className="text-sm">{rowSelection.length} users selected</p>
          <Button
            className="shadow-none"
            variant="outline"
            onClick={clearState}
          >
            Clear Selected
          </Button>
        </div>
      )}
      <div className="grid grid-cols-12 mt-8">
        <DataTable
          columns={columns}
          data={users}
          getRowId={getRowId}
          pageCount={totalPages}
          manualPagination={true}
          manualFiltering={true}
          loading={isLoading}
          pagination={pagination}
          showSelected={false}
          rowSelection={rowSelect}
          setRowSelection={setRowSelect}
          setPagination={setPagination}
          showPagination={false}
          enableRowSelection
          onSelectedRowsChange={setRowSelection}
          headerRowClassname="hover:bg-transparent"
          headerSubClassname="!px-0"
          customEmpty="No users Found"
          wrapperCls="col-span-12 w-full"
          className="border-none rounded-none"
          cellStyles={{
            orderNumber: "w-[13rem]",
          }}
          rowClick={(user) => {
            router.push(`/users/${user.original.id}`);
          }}
        />
      </div>
      <div className="mt-7">
        <AdvancedPagination
          initialPage={pagination.pageIndex}
          isLoading={isLoading}
          totalPages={totalPages}
          showItemRange
          totalItems={totalCount}
          showPageSizeSelector
          pageSize={pagination.pageSize}
          onPageSizeChange={(s) =>
            setPagination((prev) => ({
              ...prev,
              pageSize: s,
            }))
          }
          onPageChange={(page) => {
            setPagination((prev) => ({
              ...prev,
              pageIndex: page,
            }));
          }}
        />
      </div>
    </div>
  );
};

export default Users;

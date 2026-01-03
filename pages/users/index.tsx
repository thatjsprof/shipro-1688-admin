import AdvancedPagination from "@/components/ui/advanced-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { IUser } from "@/interfaces/user.interface";
import useCopy, { ICopy } from "@/lib/copy";
import { upperCaseFirst } from "@/lib/utils";
import { useGetUsersQuery } from "@/services/user.service";
import { useAppSelector } from "@/store/hooks";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { format } from "date-fns";
import debounce from "lodash.debounce";
import { Copy, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useMemo, useState } from "react";

const getColumns = (
  copyToClipboard: ({ id, text, message, style }: ICopy) => void,
  onViewClick: (row: IUser) => void,
  openEmailDialog: (row: IUser) => void
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
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Role"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <div>
            <div>
              <p className="mb-1">{upperCaseFirst(role)}</p>
            </div>
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
            title="Date Joined"
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
        return <></>;
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
  const users = data?.data.data ?? [];
  const totalPages = data?.data.totalPages ?? 0;
  const columns = getColumns(
    copyToClipboard,
    () => null,
    () => {}
  );

  const debouncedChangeHandler = useCallback(
    debounce((value) => {
      setDebouncedValue(value);
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
        <Link href="/users/new">
          <Button className="shadow-none h-11">Create New</Button>
        </Link>
      </div>
      <div className="grid grid-cols-12 mt-8">
        <DataTable
          columns={columns}
          data={users}
          pageCount={totalPages}
          manualPagination={true}
          manualFiltering={true}
          loading={isLoading}
          pagination={pagination}
          showSelected={false}
          setPagination={setPagination}
          showPagination={false}
          headerRowClassname="hover:bg-transparent"
          headerSubClassname="!px-0"
          customEmpty="No orders Found"
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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AirLocation,
  IOrder,
  OrderType,
  ShippingType,
} from "@/interfaces/order.interface";
import useCopy from "@/lib/copy";
import { useGetOrdersQuery } from "@/services/order.service";
import { useAppSelector } from "@/store/hooks";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import * as LucideIcons from "lucide-react";
import { airLocationInfo, orderStatusInfo } from "@/lib/constants";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { PaymentCodes, PaymentStatus } from "@/interfaces/payment.interface";
import { cn, formatNum } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import AdvancedPagination from "@/components/ui/advanced-pagination";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import debounce from "lodash.debounce";
import UpdateDialog from "@/components/pages/shipments/update";
import OrderTrackingDialog from "@/components/pages/shipments/tracking";
import { IAddress } from "@/interfaces/address.interface";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MultiSelect } from "@/components/ui/multi-select";
import { PaginationState } from "@tanstack/react-table";
import FadeScrollArea from "@/components/ui/fade-scrollarea";
type LucideIconName = keyof typeof LucideIcons;

enum OrderStatus {
  IN_TRANSIT = "IN_TRANSIT",
  IN_NIGERIA = "IN_NIGERIA",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export function AddressCard({ address }: { address: IAddress }) {
  if (!address) return;
  const {
    firstName,
    lastName,
    apartment,
    address: street,
    city,
    state,
    country,
    postalCode,
    phoneNumber,
    isDefault,
  } = address;

  return (
    <div className="w-full bg-white">
      <div className="space-y-1 text-sm text-gray-700">
        <p>
          {firstName} {lastName}
        </p>
        {apartment && <p>{apartment}</p>}
        <p>{street}</p>
        <p>
          {city}, {state}
        </p>
        <p className="capitalize">{country}</p>
        {postalCode && <p className="font-medium">Postal Code: {postalCode}</p>}
        <p className="font-medium">Phone: {phoneNumber}</p>
      </div>
      {isDefault && (
        <span className="mt-3 inline-block rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
          Default Address
        </span>
      )}
    </div>
  );
}

const AirTypePill = ({ location }: { location: AirLocation }) => {
  const dets = airLocationInfo[location];
  return (
    <Badge
      style={{
        backgroundColor: dets?.bgColor,
      }}
    >
      {dets?.text}
    </Badge>
  );
};

const Shipments = () => {
  const { copyToClipboard } = useCopy();
  const [open, setOpen] = useState<boolean>(false);
  const [openTracking, setOpenTracking] = useState<boolean>(false);
  const [order, setOrder] = useState<IOrder | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const userId = useAppSelector((state) => state.user.user?.id);
  const [statuses, setStatuses] = useState<
    { value: OrderStatus; label: string }[]
  >([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 20,
  });
  const { data, isLoading, isFetching } = useGetOrdersQuery(
    {
      search: debouncedValue,
      statuses: statuses.map((s) => s.value),
      page: pagination.pageIndex - 1,
      limit: pagination.pageSize,
      types: [OrderType.SHIPMENT],
    },
    {
      skip: !userId,
    }
  );
  const shipments = data?.data.data ?? [];
  const totalPages = data?.data.totalPages ?? 0;

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

  useEffect(() => {
    document.title = `Shipments | Shipro Africa`;
  }, []);

  return (
    <div className="max-w-4xl mt-7">
      <div className="flex items-center gap-3 justify-between mb-8">
        <Input
          value={searchValue}
          onChange={handleChange}
          placeholder="Search Shipment(s)"
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

        <MultiSelect<OrderStatus>
          options={Object.values(OrderStatus).map((status) => ({
            value: status,
            label: orderStatusInfo[status]?.text ?? "",
          }))}
          selected={statuses}
          onChange={(statuses) => {
            setPagination({
              pageIndex: 1,
              pageSize: 10,
            });
            setStatuses(statuses);
          }}
          className="h-11 border-zinc-300"
          placeholder="Select order statuses"
        />
      </div>
      <div className="flex flex-col gap-5 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }, (_, i) => i + 1).map((_, i) => {
            return (
              <Card key={i} className="overflow-hidden shadow-none p-0 gap-0">
                <CardHeader className="bg-white border-b p-5 !pb-3">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-[8rem]" />
                    <Skeleton className="h-5 w-[10rem]" />
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <Skeleton className="w-full h-5" />
                </CardContent>
              </Card>
            );
          })
        ) : shipments.length === 0 ? (
          <div className="w-full flex justify-center mt-10">
            <p className="text-2xl font-semibold">No shipments found</p>
          </div>
        ) : (
          <>
            {shipments.map((shipment) => {
              const deliveryAddress = shipment.deliveryAddress;
              const pendingPayments = shipment.payments.filter(
                (payment) => payment.status === PaymentStatus.PENDING
              );
              const pendingItemsPayments = shipment.shipmentItems.map((item) =>
                item.payments.filter((i) => i.status === PaymentStatus.PENDING)
              );
              const totalPendingPayments = [
                ...pendingPayments,
                ...pendingItemsPayments.flat(),
              ];
              const hasPendingPayments =
                shipment.type === OrderType.SHIPMENT &&
                totalPendingPayments.length > 0;
              const statusInfo = orderStatusInfo[shipment.status];
              const IconComponent = LucideIcons[
                statusInfo?.icon as LucideIconName
              ] as LucideIcons.LucideIcon;
              const totalShippingPayments = [
                ...shipment.payments.filter(
                  (p) => p.code === PaymentCodes.SHIPPING_FEE
                ),
              ];
              const shippingFee = totalShippingPayments.reduce((acc, cur) => {
                return (acc += +cur.amount);
              }, 0);

              return (
                <Card
                  key={shipment.id}
                  className="overflow-hidden shadow-none p-0 gap-0"
                >
                  <CardHeader className="bg-white border-b p-5 !pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          {shipment.orderNumber}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <LucideIcons.Truck className="w-4 h-4" />
                          Created on{" "}
                          {format(shipment.createdAt, "MM/dd/yyy h:mm a")}
                        </CardDescription>
                        <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                          <LucideIcons.User className="w-4 h-4" />
                          Owned by {shipment.user?.name}
                        </p>
                        {shipment.shippingType && (
                          <div className="mt-2">
                            {shipment.airLocation ? (
                              <AirTypePill location={shipment.airLocation} />
                            ) : shipment.shippingType === ShippingType.SEA ? (
                              <Badge
                                style={{
                                  backgroundColor: "#10B981",
                                }}
                              >
                                Sea
                              </Badge>
                            ) : (
                              ""
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {IconComponent && (
                          <div className="w-full sm:w-fit mb-3 sm:mb-0">
                            <div
                              className="rounded-full w-fit flex items-center gap-2 px-[10px] mr-2 py-[6px] text-[.82rem] font-semibold text-nowrap"
                              style={{
                                backgroundColor: statusInfo?.bgColor,
                                color: statusInfo?.color ?? "#fff",
                              }}
                            >
                              <IconComponent className="size-4" />
                              {statusInfo?.text}
                            </div>
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="shadow-none h-11"
                          onClick={() => {
                            setOrder(shipment);
                            setOpen(true);
                          }}
                        >
                          <LucideIcons.Pencil className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="shadow-none h-11"
                          onClick={() => {
                            setOrder(shipment);
                            setOpenTracking(true);
                          }}
                        >
                          <LucideIcons.Eye className="w-4 h-4" />
                          Track
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-2 gap-6 mb-6 p-6 pb-0">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <LucideIcons.Package className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <div className="text-sm text-gray-600">
                              Total Weight
                            </div>
                            <div className="font-semibold">
                              {formatNum(
                                shipment.packageWeight ||
                                  shipment.shipmentItems.reduce(
                                    (acc, cur) => (acc += cur.packageWeight),
                                    0
                                  ) ||
                                  0
                              )}
                              kg
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <LucideIcons.Truck className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <div className="text-sm text-gray-600">
                              Tracking Number
                            </div>
                            <div className="font-semibold">
                              {shipment.trackingNumber ?? "---"}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <LucideIcons.Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <div className="text-sm text-gray-600">
                              Delivered
                            </div>
                            <div className="font-semibold">
                              {shipment.deliveredAt
                                ? format(
                                    shipment.deliveredAt,
                                    "MM/dd/yyy HH:mm a"
                                  )
                                : "---"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <LucideIcons.MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <div className="text-sm text-gray-600">
                              Shipping Fee
                            </div>
                            <div className="font-semibold">
                              {shippingFee > 0
                                ? `₦${formatNum(shippingFee)}`
                                : "---"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {deliveryAddress && (
                      <div className="px-6 pb-0 -mt-1">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="address">
                            <AccordionTrigger className="flex items-center gap-2 justify-normal w-fit flex-none cursor-pointer p-0 mb-6 [&[data-state=open]]:mb-3 text-sm text-gray-600">
                              View delivery address
                            </AccordionTrigger>
                            <AccordionContent>
                              <AddressCard address={deliveryAddress} />
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    )}
                    <div className="border-t">
                      <FadeScrollArea className="flex gap-3 relative max-h-[30rem]">
                        <div className="space-y-2 p-6">
                          {shipment.shipmentItems.map((item, idx) => {
                            const images = item.items
                              .map((i) => (i.pictures ?? []).map((p) => p.url))
                              .flat();
                            const image = images?.[0] ?? item.product?.image;
                            const nameToUse =
                              item.name ?? item.product.description;
                            const quantityToUse =
                              item.items
                                .map((i) => i.quantity ?? 0)
                                .reduce((acc, cur) => (acc += cur), 0) ||
                              item.quantity;

                            return (
                              <div
                                key={idx}
                                className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between gap-5 p-3 bg-gray-50 rounded"
                              >
                                <div className="flex items-start gap-3">
                                  {image && (
                                    <img
                                      src={`${process.env.SERVER_URL}/proxy?url=${image}`}
                                      className="h-16 w-16 object-cover object-center rounded-lg flex-shrink-0"
                                    />
                                  )}
                                  <div>
                                    <span className="hidden sm:inline-block text-gray-900 font-medium">
                                      {nameToUse}
                                    </span>
                                    <p className="sm:hidden text-[.94rem] font-medium sm:font-medium cursor-pointer">
                                      {nameToUse}
                                    </p>
                                    <span className="text-gray-600 block text-sm">
                                      Qty: {quantityToUse}
                                    </span>
                                  </div>
                                </div>
                                {item.trackingNumber && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs cursor-pointer"
                                    onClick={() => {
                                      copyToClipboard({
                                        id: item.id,
                                        text: item.trackingNumber,
                                        message:
                                          "Tracking number copied to clipboard",
                                      });
                                    }}
                                  >
                                    <LucideIcons.Copy className="w-4 h-4" />
                                    {item.trackingNumber}
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </FadeScrollArea>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}
        {/* <PaymentDialog
        onOpenChange={setOpenPayment}
        open={openPayment}
        orderItemId={order?.id}
        payments={(order?.payments ?? []).filter(
          (payment) => payment.status === PaymentStatus.PENDING
        )}
      /> */}
        <div className="mt-7">
          <AdvancedPagination
            initialPage={pagination.pageIndex}
            isLoading={isLoading || isFetching}
            totalPages={totalPages}
            showPageSizeSelector
            pageSize={pagination.pageSize}
            onPageSizeChange={(s) =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: 1,
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
        <UpdateDialog open={open} setOpen={setOpen} order={order} />
        <OrderTrackingDialog
          order={order!}
          open={openTracking}
          setOpen={setOpenTracking}
        />
      </div>
    </div>
  );
};

export default Shipments;

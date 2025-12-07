import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AirLocation,
  IOrderItem,
  OrderStatus,
  ShippingType,
} from "@/interfaces/order.interface";
import { orderStatusInfo } from "@/lib/constants";
import { cn, formatNum } from "@/lib/utils";
import { ShippingFormValues, shippingSchema } from "@/schemas/shipment";
import { useCreateShipmentMutation } from "@/services/order.service";
import { zodResolver } from "@hookform/resolvers/zod";
import * as LucideIcons from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
type LucideIconName = keyof typeof LucideIcons;

interface IShipmentDialogProps {
  open: boolean;
  orders: IOrderItem[];
  onOpenChange: (open: boolean) => void;
  clearState: () => void;
}

const ShipmentDialog = ({
  open,
  orders,
  clearState,
  onOpenChange,
}: IShipmentDialogProps) => {
  const router = useRouter();
  const ordersToUse = orders.filter(
    (i) => i.status === OrderStatus.AT_WAREHOUSE
  );
  const {
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormValues>({
    defaultValues: {
      shippingType: undefined,
      airLocation: undefined,
    },
    resolver: zodResolver(shippingSchema),
  });
  const [createShipment, { isLoading }] = useCreateShipmentMutation();

  const shippingType = watch("shippingType");
  const airLocation = watch("airLocation");

  const itemsByUser = ordersToUse.reduce((acc, item) => {
    const userId = item.order.user.name;
    if (!acc[userId]) {
      acc[userId] = [];
    }
    acc[userId].push(item);
    return acc;
  }, {} as Record<string, IOrderItem[]>);

  const handleShippingTypeSelect = (type: ShippingType) => {
    setValue("shippingType", type, { shouldValidate: true });
    if (type === ShippingType.SEA) {
      setValue("airLocation", undefined, { shouldValidate: true });
    }
  };

  const handleSelectAirLocation = (location: AirLocation) => {
    setValue("airLocation", location, { shouldValidate: true });
  };
  const hasSensitiveItems = Array.from(ordersToUse.values()).some((item) =>
    (item.tags ?? []).includes("sensitive")
  );

  const handleCreateShipment = async (values: ShippingFormValues) => {
    const { shippingType, airLocation } = values;
    if (ordersToUse.length === 0) return;

    try {
      await createShipment({
        itemIds: ordersToUse.map((o) => o.id),
        shippingType,
        airLocation,
      }).unwrap();
      onOpenChange(false);
      reset();
      clearState();
      router.push(`/shipments`);
    } catch (error) {
      console.error("Failed to create shipment:", error);
    }
  };

  useEffect(() => {
    if (shippingType === ShippingType.AIR && hasSensitiveItems)
      setValue("airLocation", AirLocation.HK);
  }, [shippingType, hasSensitiveItems]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[95vh] overflow-hidden p-0">
        <ScrollArea className="max-h-[95vh] h-full">
          <div className="p-6">
            <form
              onSubmit={handleSubmit(handleCreateShipment)}
              className="flex flex-col"
            >
              <DialogHeader>
                <DialogTitle>Create Shipment</DialogTitle>
                <DialogDescription>
                  Create a new shipment from order items
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6 mb-2 flex gap-3 flex-col">
                {Object.entries(itemsByUser).map(([k, v]) => {
                  return (
                    <div className="text-gray-600 text-[.8rem]" key={k}>
                      <p className="font-semibold mb-1">{k}</p>
                      <ul className="list-outside !list-disc ml-3 flex flex-col gap-2">
                        {v.map((order) => {
                          const product = order.product;
                          const name = order.name || product?.description;
                          const status = order.status;
                          const statusInfo = orderStatusInfo[status];
                          const IconComponent = LucideIcons[
                            statusInfo?.icon as LucideIconName
                          ] as LucideIcons.LucideIcon;

                          return (
                            <li key={order.id}>
                              {order.product?.url ? (
                                <a
                                  target="_blank"
                                  href={order.product.url}
                                  className="hover:text-secondary duration-200 transition-colors"
                                >
                                  {name}
                                </a>
                              ) : (
                                name
                              )}
                              <span
                                className="rounded-full inline-flex items-center gap-1 px-[10px] py-0.5 text-xs font-medium ml-2 align-middle"
                                style={{
                                  backgroundColor: statusInfo?.bgColor,
                                  color: statusInfo?.color ?? "#fff",
                                }}
                              >
                                <IconComponent className="size-3 shrink-0" />
                                {statusInfo?.text}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Total Weight</p>
                  <div className="font-semibold">
                    {formatNum(
                      Object.values(Array.from(ordersToUse)).reduce(
                        (acc, cur) =>
                          (acc += +(cur.packageWeight || cur.totalWeight)),
                        0
                      ) || 0
                    )}
                    kg
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium">Shipping Type</p>
                  <div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "flex-1 h-11 shadow-none",
                          shippingType === ShippingType.AIR && "!border-primary"
                        )}
                        onClick={() =>
                          handleShippingTypeSelect(ShippingType.AIR)
                        }
                      >
                        Air Shipping
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "flex-1 h-11 shadow-none",
                          shippingType === ShippingType.SEA && "!border-primary"
                        )}
                        onClick={() =>
                          handleShippingTypeSelect(ShippingType.SEA)
                        }
                      >
                        Sea Shipping
                      </Button>
                    </div>
                    {errors.shippingType && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.shippingType.message}
                      </p>
                    )}
                  </div>
                </div>
                {shippingType === ShippingType.AIR && (
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-col gap-3">
                      <p className="text-sm font-medium">
                        Air Shipping Location
                      </p>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant={"outline"}
                          className={cn(
                            "flex-1 h-11 shadow-none",
                            airLocation === AirLocation.HK && "!border-primary"
                          )}
                          onClick={() =>
                            handleSelectAirLocation(AirLocation.HK)
                          }
                        >
                          HK
                        </Button>
                        {!hasSensitiveItems && (
                          <Button
                            type="button"
                            variant={"outline"}
                            className={cn(
                              "flex-1 h-11 shadow-none",
                              airLocation === AirLocation.GZ &&
                                "!border-primary"
                            )}
                            onClick={() =>
                              handleSelectAirLocation(AirLocation.GZ)
                            }
                          >
                            GZ
                          </Button>
                        )}
                      </div>
                    </div>
                    {errors.airLocation && (
                      <p className="text-sm text-destructive">
                        {errors.airLocation.message}
                      </p>
                    )}
                    {hasSensitiveItems && (
                      <div className="rounded-md bg-yellow-500/10 p-3 text-destructive mt-5">
                        <p className="text-sm">
                          One or more of the items contain sensitive goods.
                          Combining sensitive goods with normal goods makes the
                          package go through HK when shipping by air.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter className="mt-10">
                <Button
                  type="button"
                  variant="outline"
                  className="font-semibold px-5 h-12 shadow-none"
                  onClick={() => {
                    onOpenChange(false);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="font-semibold px-5 h-12 shadow-none"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isLoading && (
                    <Icons.spinner className="h-3 w-3 animate-spin" />
                  )}
                  Create Shipment
                </Button>
              </DialogFooter>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ShipmentDialog;

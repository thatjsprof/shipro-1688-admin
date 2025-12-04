import React, { SetStateAction, Dispatch, useState, useEffect } from "react";
import { useForm, useFieldArray, Control } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Package,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Clock,
  Edit2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IOrder,
  IOrderTracking,
  OrderStatus,
  TrackingStage,
} from "@/interfaces/order.interface";
import {
  orderStatusInfo,
  orderStatusTitle,
  shipmentStatusDesc,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  useAddTrackingUpdateMutation,
  useGetTrackingUpdatesQuery,
  useUpdateTrackingMutation,
} from "@/services/order.service";
import { format } from "date-fns";
import { notify } from "@/lib/toast";
import { Checkbox } from "@/components/ui/checkbox";

const stageLabels: Record<TrackingStage, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
};

const trackingUpdateSchema = z.object({
  trackingId: z.string().optional(),
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional().or(z.literal("")),
  status: z.nativeEnum(OrderStatus).optional(),
  stage: z.nativeEnum(TrackingStage),
  updateOrder: z.boolean().optional(),
  useDefault: z.boolean().optional(),
  sendEmail: z.boolean().optional(),
  createdAt: z.date().optional(),
});

const trackingFormSchema = z.object({
  trackingUpdates: z.array(trackingUpdateSchema),
});

type TrackingFormValues = z.infer<typeof trackingFormSchema>;
type UpdateInput = z.infer<typeof trackingUpdateSchema>;

interface OrderTrackingDialogProps {
  order: IOrder;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const OrderTrackingDialog: React.FC<OrderTrackingDialogProps> = ({
  order,
  open,
  setOpen,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [addTracking] = useAddTrackingUpdateMutation();
  const [updateTracking] = useUpdateTrackingMutation();
  const { data } = useGetTrackingUpdatesQuery(
    {
      orderId: order?.id,
      noLimit: true,
    },
    { skip: !order?.id }
  );
  const trackingUpdates = data?.data.data || [];
  const mainForm = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingFormSchema),
    defaultValues: {
      trackingUpdates,
    },
  });
  const defaultValues = {
    title: "",
    description: "",
    status: order?.status || OrderStatus.PLACED,
    stage: TrackingStage.COMPLETED,
    createdAt: new Date(),
    updateOrder: false,
    sendEmail: false,
    useDefault: false,
  };

  const { fields, append, remove, move, update } = useFieldArray({
    control: mainForm.control as Control<TrackingFormValues>,
    name: "trackingUpdates",
  });

  const form = useForm<UpdateInput>({
    resolver: zodResolver(trackingUpdateSchema),
    defaultValues,
  });

  const onSubmit = async (data: UpdateInput) => {
    try {
      let response: ApiResponse<IOrderTracking[]>;
      if (data.trackingId) {
        response = await updateTracking({
          id: data.trackingId,
          data: {
            orderId: order.id,
            title: data.title,
            description: data.description,
            stage: data.stage || TrackingStage.COMPLETED,
            status: data.status,
            updateOrder: data.updateOrder,
            sendEmail: data.sendEmail,
          },
        }).unwrap();
      } else {
        response = await addTracking({
          orderId: order.id,
          title: data.title,
          description: data.description,
          stage: data.stage || TrackingStage.COMPLETED,
          status: data.status,
        }).unwrap();
      }
      if (response.status === 200) {
        form.reset(defaultValues);
        setEditingIndex(null);
        notify(response.message, "success");
      } else {
        notify(response.message, "error");
      }
    } catch (err) {
      console.error("Tracking could not be added", "error");
    }
  };

  const handleEdit = (index: number) => {
    const tracking = fields[index];
    setEditingIndex(index);
    form.reset({
      trackingId: tracking.trackingId,
      title: tracking.title,
      description: tracking.description || "",
      status: tracking.status || OrderStatus.PLACED,
      stage: tracking.stage,
      createdAt: new Date(),
      updateOrder: false,
      sendEmail: false,
      useDefault: false,
    });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    form.reset(defaultValues);
  };

  const getStageColor = (stage: TrackingStage): string => {
    switch (stage) {
      case TrackingStage.COMPLETED:
        return "bg-green-100 text-green-800";
      case TrackingStage.PENDING:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    if (trackingUpdates.length === 0) return;
    mainForm.reset({
      trackingUpdates: trackingUpdates.map((t) => {
        return {
          trackingId: t.id,
          ...t,
        };
      }),
    });
  }, [trackingUpdates]);

  useEffect(() => {
    if (!order) return;
    form.reset({
      status: order.status,
      stage: TrackingStage.COMPLETED,
    });
  }, [order]);

  console.log(form.formState.errors);

  useEffect(() => {
    if (form.watch("useDefault")) {
      const title = Object.entries(orderStatusTitle).find(([k]) => {
        return k === form.watch("status");
      })?.[1];
      const desc = Object.entries(shipmentStatusDesc).find(([k, v]) => {
        return k === form.watch("status");
      })?.[1];
      if (title) form.setValue("title", title);
      if (desc) form.setValue("description", desc);
    }
  }, [form.watch("status")]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-7">
            <DialogHeader>
              <DialogTitle>Order Tracking</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="p-5 rounded-xl border border-gray-200">
                <Form {...form}>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <div className="flex flex-col space-y-1">
                            <FormControl>
                              <Input
                                // items={[
                                //   OrderStatus.PENDING_TRANSIT,
                                //   OrderStatus.IN_TRANSIT,
                                //   OrderStatus.IN_NIGERIA,
                                //   OrderStatus.OUT_FOR_DELIVERY,
                                //   OrderStatus.PROCESSING,
                                //   OrderStatus.DELIVERED,
                                //   OrderStatus.CANCELLED,
                                // ].map((o) => {
                                //   return {
                                //     label: orderStatusTitle[o] ?? "",
                                //     value: o,
                                //   };
                                // })}
                                {...field}
                                placeholder="e.g., Package Out for Delivery"
                                error={!!form.formState.errors.title}
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <div className="flex flex-col space-y-1">
                            <FormControl>
                              <Textarea
                                // items={[
                                //   OrderStatus.PENDING_TRANSIT,
                                //   OrderStatus.IN_TRANSIT,
                                //   OrderStatus.IN_NIGERIA,
                                //   OrderStatus.OUT_FOR_DELIVERY,
                                //   OrderStatus.PROCESSING,
                                //   OrderStatus.DELIVERED,
                                //   OrderStatus.CANCELLED,
                                // ].map((o) => {
                                //   return {
                                //     label: shipmentStatusDesc[o] ?? "",
                                //     value: o,
                                //   };
                                // })}
                                {...field}
                                placeholder="e.g., Detailed description of step"
                                error={!!form.formState.errors.description}
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <div className="flex flex-col justify-start">
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    OrderStatus.PENDING_TRANSIT,
                                    OrderStatus.IN_TRANSIT,
                                    OrderStatus.IN_NIGERIA,
                                    OrderStatus.OUT_FOR_DELIVERY,
                                    OrderStatus.PROCESSING,
                                    OrderStatus.DELIVERED,
                                    OrderStatus.CANCELLED,
                                  ].map((value) => (
                                    <SelectItem key={value} value={value}>
                                      {orderStatusInfo[value]?.text}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                            <FormField
                              control={form.control}
                              name="useDefault"
                              render={({ field }) => {
                                return (
                                  <FormItem>
                                    <div className="flex items-center gap-2 mt-3">
                                      <FormControl>
                                        <Checkbox
                                          id="useDefault"
                                          checked={form.watch("useDefault")}
                                          onCheckedChange={(checked) => {
                                            if (
                                              checked &&
                                              form.watch("status")
                                            ) {
                                              const title = Object.entries(
                                                orderStatusTitle
                                              ).find(([k]) => {
                                                return (
                                                  k === form.watch("status")
                                                );
                                              })?.[1];
                                              const desc = Object.entries(
                                                shipmentStatusDesc
                                              ).find(([k, v]) => {
                                                return (
                                                  k === form.watch("status")
                                                );
                                              })?.[1];
                                              if (title)
                                                form.setValue("title", title);
                                              if (desc)
                                                form.setValue(
                                                  "description",
                                                  desc
                                                );
                                            }
                                            field.onChange(checked);
                                          }}
                                          className="shadow-none"
                                          disabled={!form.watch("status")}
                                        />
                                      </FormControl>
                                      <FormLabel
                                        className="text-nowrap"
                                        htmlFor="useDefault"
                                      >
                                        Default Title & Description
                                      </FormLabel>
                                    </div>
                                  </FormItem>
                                );
                              }}
                            />
                            <FormField
                              control={form.control}
                              name="updateOrder"
                              render={({ field }) => {
                                return (
                                  <FormItem>
                                    <div className="flex items-center gap-2 mt-3">
                                      <FormControl>
                                        <Checkbox
                                          id="updateOrder"
                                          checked={form.watch("updateOrder")}
                                          onCheckedChange={field.onChange}
                                          className="shadow-none"
                                          disabled={!form.watch("status")}
                                        />
                                      </FormControl>
                                      <FormLabel
                                        className="text-nowrap"
                                        htmlFor="updateOrder"
                                      >
                                        Update Order Status
                                      </FormLabel>
                                    </div>
                                  </FormItem>
                                );
                              }}
                            />
                            <FormField
                              control={form.control}
                              name="sendEmail"
                              render={({ field }) => {
                                return (
                                  <FormItem>
                                    <div className="flex items-center gap-2 mt-3">
                                      <FormControl>
                                        <Checkbox
                                          id="sendEmail"
                                          checked={form.watch("sendEmail")}
                                          onCheckedChange={field.onChange}
                                          className="shadow-none"
                                          disabled={!form.watch("status")}
                                        />
                                      </FormControl>
                                      <FormLabel
                                        className="text-nowrap"
                                        htmlFor="sendEmail"
                                      >
                                        Send Email
                                      </FormLabel>
                                    </div>
                                  </FormItem>
                                );
                              }}
                            />
                          </div>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="stage"
                        render={({ field }) => (
                          <FormItem className="flex flex-col justify-start">
                            <FormLabel>Tracking Stage</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Stage" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(TrackingStage).map((value) => (
                                  <SelectItem key={value} value={value}>
                                    {stageLabels[value]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      {editingIndex !== null && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="flex-1 px-4 py-2 border rounded-lg shadow-none h-11"
                        >
                          Cancel Edit
                        </Button>
                      )}
                      <Button
                        type="button"
                        onClick={form.handleSubmit(onSubmit)}
                        className="flex-1 px-4 py-2 rounded-lg h-11 shadow-none"
                      >
                        <Plus className="w-4 h-4" />
                        {editingIndex !== null ? "Update" : "Add"} Tracking
                      </Button>
                    </div>
                  </div>
                </Form>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-4">
                  Tracking History ({fields.length})
                </h3>
                {fields.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    No tracking updates yet.
                  </div>
                ) : (
                  <div className="space-y-0">
                    {fields.map((tracking, index) => (
                      <div
                        key={tracking.id}
                        className="relative flex gap-4 group"
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-4 h-4 rounded-full bg-primary border-4 border-white"></div>
                          {index < fields.length - 1 && (
                            <div className="w-0.5 flex-1 bg-primary/20"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-3">
                          <div className="bg-white p-4 rounded-xl border shadow-none">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-semibold">
                                  {tracking.title}
                                </h4>
                                {tracking.description && (
                                  <p className="text-sm text-gray-600">
                                    {tracking.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                                  <Clock className="w-3 h-3" />
                                  {tracking.createdAt
                                    ? format(
                                        tracking.createdAt,
                                        "dd/MM/yyy h:mm a"
                                      )
                                    : "---"}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100">
                                <button
                                  disabled={index === 0}
                                  onClick={() => move(index, index - 1)}
                                  className="p-1 hover:bg-gray-200 rounded"
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </button>
                                <button
                                  disabled={index === fields.length - 1}
                                  onClick={() => move(index, index + 1)}
                                  className="p-1 hover:bg-gray-200 rounded"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEdit(index)}
                                  className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => remove(index)}
                                  className="p-1 hover:bg-red-100 rounded text-red-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <span
                              className={`-mt-3 block w-fit text-xs px-2 py-1 rounded-full ${getStageColor(
                                tracking.stage
                              )}`}
                            >
                              {stageLabels[tracking.stage]}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default OrderTrackingDialog;

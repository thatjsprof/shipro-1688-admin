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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IOrder, OrderStatus } from "@/interfaces/order.interface";
import { orderStatusInfo } from "@/lib/constants";
import { notify } from "@/lib/toast";
import { useDeleteShipmentMutation } from "@/services/order.service";
import { Trash } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

interface IDeleteShipmentDialog {
  order: IOrder | null;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onDeleted?: () => void;
}

const DeleteShipmentDialog = ({
  order,
  open,
  setOpen,
  onDeleted,
}: IDeleteShipmentDialog) => {
  const [itemStatus, setItemStatus] = useState<OrderStatus>(
    OrderStatus.AT_WAREHOUSE
  );
  const [deleteShipment, { isLoading }] = useDeleteShipmentMutation();

  const handleDelete = async () => {
    if (!order?.id) return;
    try {
      const response = await deleteShipment({
        id: order.id,
        itemStatus,
      }).unwrap();
      if (response.status === 200) {
        notify(response.message, "success");
        setOpen(false);
        onDeleted?.();
      } else {
        notify(response.message, "error");
      }
    } catch {
      notify("Could not delete shipment", "error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Delete shipment?</DialogTitle>
          <DialogDescription>
            This permanently removes shipment{" "}
            <strong className="font-medium">{order?.orderNumber}</strong>. Choose
            the status to restore its order items to before confirming.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Order item status</p>
          <Select
            value={itemStatus}
            onValueChange={(value) => setItemStatus(value as OrderStatus)}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(OrderStatus).map(([key, value]) => (
                <SelectItem key={key} value={value}>
                  {orderStatusInfo[value]?.text ?? value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            className="shadow-none h-10"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="shadow-none bg-destructive hover:bg-destructive h-10"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading && <Icons.spinner className="h-3 w-3 animate-spin" />}
            <Trash className="size-4 mr-1" />
            Delete shipment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteShipmentDialog;

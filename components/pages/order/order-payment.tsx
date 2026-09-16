import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import { IOrder } from "@/interfaces/order.interface";
import { Dispatch, SetStateAction, useState } from "react";
import OrderBasic from "./order-basic";
import Payment from "../shipments/payment";

enum ITabs {
  Basic = "Basic",
  Payment = "Payment",
}

interface IupdateDialog {
  order: IOrder | null;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const UpdateDialog = ({ order, open, setOpen }: IupdateDialog) => {
  const [tab, setTab] = useState<string>(ITabs.Basic);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b px-7 py-5">
          <DialogTitle>Update Order</DialogTitle>
        </DialogHeader>
        <Tabs
          value={tab}
          onValueChange={setTab}
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <div className="shrink-0 px-7 pt-4">
            <TabsList>
              <TabsTrigger value={ITabs.Basic}>Basic</TabsTrigger>
              <TabsTrigger value={ITabs.Payment}>Payment</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent
            value={ITabs.Basic}
            className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
          >
            <OrderBasic order={order} setOpen={setOpen} open={open} />
          </TabsContent>
          <TabsContent
            value={ITabs.Payment}
            className="mt-0 min-h-0 flex-1 overflow-y-auto px-7 py-5 data-[state=inactive]:hidden"
          >
            <Payment order={order} setOpen={setOpen} open={open} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateDialog;

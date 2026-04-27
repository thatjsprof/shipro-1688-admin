import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import { IOrder } from "@/interfaces/order.interface";
import { Dispatch, SetStateAction, useState } from "react";
import Basic from "./basic";
import Payment from "./payment";

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
      <DialogContent className="p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-7">
            <DialogHeader>
              <DialogTitle>Update Shipment</DialogTitle>
            </DialogHeader>
            <Tabs value={tab} onValueChange={setTab} className="mt-8">
              <TabsList>
                <TabsTrigger value={ITabs.Basic}>Basic</TabsTrigger>
                <TabsTrigger value={ITabs.Payment}>Payment</TabsTrigger>
              </TabsList>
              <TabsContent value={ITabs.Basic} className="pt-5">
                <Basic order={order} setOpen={setOpen} open={open} />
              </TabsContent>
              <TabsContent className="pt-5" value={ITabs.Payment}>
                <Payment order={order} setOpen={setOpen} open={open} />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateDialog;

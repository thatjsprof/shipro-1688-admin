import { PaymentStatusPill } from "@/components/shared/status-pill";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { RMBPurchase } from "@/interfaces/rmb.interface";
import { formatNum } from "@/lib/utils";
import Link from "next/link";

interface ISheetProps {
  purchase: RMBPurchase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PurchaseSheet = ({ open, onOpenChange, purchase }: ISheetProps) => {
  if (!purchase) return null;
  const image = `${process.env.SERVER_URL}/proxy?url=${purchase.details.aliPayQRcode}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg max-h-[100vh] h-full w-full overflow-hidden">
        <ScrollArea className="max-h-[100vh] h-full">
          <SheetHeader>
            <SheetTitle>RMB Purchase Details</SheetTitle>
            <SheetDescription>
              View details about this purchase order
            </SheetDescription>
          </SheetHeader>
          <div className="p-4 pt-0">
            <div className="flex items-center gap-[0.9rem] text-nowrap capitalize mb-6">
              <PaymentStatusPill status={purchase.status} />
            </div>
            <div className="mb-7">
              <div className="border mt-3 rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt={`Purchase QR Code ${purchase.id}`}
                  className="h-[30rem] w-auto object-center object-cover"
                />
              </div>
              <Link
                target="_blank"
                href={image}
                className="text-zinc-600 text-sm"
              >
                Open in new tab
              </Link>
            </div>
            <div className="flex flex-col gap-1">
              <p>Alipay ID: {purchase.details.alipayID}</p>
              <p>Alipay Name: {purchase.details.aliPayName}</p>
              <p>RMB Amount: {formatNum(purchase.rmbAmount)}</p>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default PurchaseSheet;

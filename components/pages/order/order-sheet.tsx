import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { IOrderItem } from "@/interfaces/order.interface";
import { formatNum, upperCaseFirst } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { orderStatusInfo } from "@/lib/constants";
import { IAddress } from "@/interfaces/address.interface";
type LucideIconName = keyof typeof LucideIcons;

interface ISheetProps {
  item: IOrderItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
    <div className="w-full max-w-md rounded-2xl border bg-white p-5 mt-8">
      <h3 className="text-lg font-semibold mb-3">Delivery Address</h3>
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

const OrderSheet = ({ open, onOpenChange, item }: ISheetProps) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  if (!item) return null;

  const product = item.product;
  const name = item.name || product?.description;
  const items = item?.items ?? [];
  const adminImages = (item.images ?? []).map((i) => i.url);
  const images = items.map((i) => (i.pictures ?? []).map((p) => p.url)).flat();
  const pictureItems = items?.filter((item) => item.type === "picture") || [];
  const linkItems = items?.filter((item) => item.type === "link") || [];
  const quantity =
    items.map((i) => i.quantity ?? 0).reduce((acc, cur) => (acc += cur), 0) ||
    item.quantity;
  const productImages = (product?.images ?? [])
    .filter((p) => p.type === "image")
    .map((p) => p.url);
  const allImages = [...adminImages, ...productImages, ...images];
  const status = item.status;
  const statusInfo = orderStatusInfo[status];
  const deliveryAddress = item.order.deliveryAddress;
  const IconComponent = LucideIcons[
    statusInfo?.icon as LucideIconName
  ] as LucideIcons.LucideIcon;

  const scrollToImage = (imageUrl: string) => {
    const index = allImages.indexOf(imageUrl);
    if (index !== -1 && carouselApi) {
      carouselApi.scrollTo(index);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg max-h-[100vh] h-full w-full overflow-hidden">
        <ScrollArea className="max-h-[100vh] h-full">
          <SheetHeader>
            <SheetTitle>Order Item Details</SheetTitle>
            <SheetDescription>
              View details about this order item
            </SheetDescription>
          </SheetHeader>
          <div className="p-4 pt-0">
            {IconComponent && (
              <div
                className="rounded-full flex items-center gap-2 px-[10px] py-[6px] text-[.82rem] w-fit font-medium mb-6"
                style={{
                  backgroundColor: statusInfo?.bgColor,
                  color: statusInfo?.color ?? "#fff",
                }}
              >
                <IconComponent className="size-4" />
                {statusInfo?.text}
              </div>
            )}
            <div className="flex-1">
              {allImages.length > 0 && (
                <Carousel
                  className="w-full p-0 border mb-7 mt-3 rounded-lg overflow-hidden"
                  setApi={setCarouselApi}
                >
                  <CarouselContent className="p-0">
                    {allImages.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="flex items-center justify-center h-[30rem] w-full overflow-hidden">
                          <img
                            src={`${process.env.SERVER_URL}/proxy?url=${image}`}
                            alt={`Product image ${index + 1}`}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-5" />
                  <CarouselNext className="right-5" />
                </Carousel>
              )}
              <h4 className="font-medium text-gray-900">{name}</h4>
              {item?.category && (
                <p className="text-sm text-gray-600 mt-2">
                  Category: {item.category}
                </p>
              )}
              {(product?.url || product?.internalProduct) && (
                <a
                  target="_blank"
                  href={
                    product?.internalProduct
                      ? `${process.env.CLIENT_URL}/products/${product.id}`
                      : product.url
                  }
                  className="text-[#fc6320] hover:underline break-all line-clamp-1 mt-2 w-fit"
                >
                  {product?.internalProduct
                    ? `${process.env.CLIENT_URL}/products/${product.id}`
                    : product.url}
                </a>
              )}
              <p className="text-sm text-gray-600 mt-2">Quantity: {quantity}</p>
              {item.variants && (
                <div className="text-sm text-slate-600 flex items-center gap-3 mt-2">
                  {Object.entries(item?.variants ?? {}).map(([key, value]) => {
                    return <p key={key}>{upperCaseFirst(value.original)}</p>;
                  })}
                </div>
              )}
              {item.note && (
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Note:</span> {item.note}
                </div>
              )}
              {pictureItems.length > 0 && (
                <div className="mt-4">
                  <strong className="text-sm">Pictures:</strong>
                  {pictureItems.map((item, itemIndex) => (
                    <div key={itemIndex} className="ml-4 mt-3">
                      {item.pictures && item.pictures.length > 0 && (
                        <div className="flex gap-2.5 flex-wrap mb-2">
                          {item.pictures.map((pic, picIndex) => (
                            <img
                              key={picIndex}
                              src={pic.url}
                              alt={pic.filename}
                              className="w-[50px] h-[50px] object-cover rounded-[15px] border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => scrollToImage(pic.url)}
                            />
                          ))}
                        </div>
                      )}
                      <div className="text-sm">
                        Qty: {formatNum(item.quantity)}
                      </div>
                      {item.note && (
                        <div className="text-sm italic text-gray-500 mt-1">
                          {item.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {linkItems.length > 0 && (
                <div className="mt-4">
                  <strong className="text-sm">Links:</strong>
                  {linkItems.map((item, itemIndex) => (
                    <div key={itemIndex} className="ml-4 mt-2">
                      {item.link && (
                        <div className="text-sm">
                          <a
                            href={item.link}
                            target="_blank"
                            className="text-[#fc6320] hover:underline break-all line-clamp-1"
                          >
                            {item.link}
                          </a>
                        </div>
                      )}
                      <div className="text-sm">
                        Qty: {formatNum(item.quantity)}
                      </div>
                      {item.note && (
                        <div className="text-sm italic text-gray-500 mt-1">
                          {item.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <AddressCard address={deliveryAddress} />
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default OrderSheet;

import OrderLayout from "@/layouts/order.layout";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const Order = () => {
  return (
    <div>
      <div className="mb-6 mt-5">
        <Link href="/orders" className="flex items-center gap-3 w-fit">
          <ArrowLeft className="size-5" /> Back to Orders
        </Link>
      </div>
      <OrderLayout />;
    </div>
  );
};

export default Order;

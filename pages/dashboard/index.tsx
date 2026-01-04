import PaymentChart from "@/components/pages/dashboard/payment-chart";
import MetricPill from "@/components/shared/metric-pill";
import { formatNum } from "@/lib/utils";
import { useGetDashboardQuery } from "@/services/management.service";
import { Clock, ShoppingBag, ShoppingBasket, Wallet } from "lucide-react";

const Dashboard = () => {
  const { data, isLoading } = useGetDashboardQuery();
  const stats = data?.data;

  return (
    <div className="mt-6">
      <div className="mb-12 mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <MetricPill
          className="px-0"
          title="All Time Orders"
          content={`₦${formatNum(stats?.allTimeOrders ?? 0)}`}
          icon={<ShoppingBag strokeWidth={1.2} className="size-8" />}
          isLoading={isLoading}
        />
        <MetricPill
          className="px-0"
          title="Orders this month"
          content={`₦${formatNum(stats?.thisMonth ?? 0)}`}
          icon={<ShoppingBasket strokeWidth={1.2} className="size-8" />}
          isLoading={isLoading}
        />
        <MetricPill
          className="px-0"
          title="Pending Orders"
          content={`₦${formatNum(stats?.pendingOrders ?? 0)}`}
          icon={<Clock strokeWidth={1.2} className="size-8" />}
          isLoading={isLoading}
        />
        <MetricPill
          className="px-0"
          title="All Time Payments"
          content={`₦${formatNum(stats?.allTimeTotalPayments ?? 0)}`}
          icon={<Wallet strokeWidth={1.2} className="size-8" />}
          isLoading={isLoading}
        />
      </div>
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-5">Payment Information</h2>
        <div className="-ml-8">
          <PaymentChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

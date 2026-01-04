import PaymentChart from "@/components/pages/dashboard/payment-chart";

const Dashboard = () => {
  return (
    <div className="mt-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="border p-4 px-5 col-span-3 flex flex-col gap-1 rounded-md">
          <p className="text-sm text-gray-600 font-medium">
            Number of shipments this month
          </p>
          <p className="font-semibold text-3xl">0</p>
        </div>
        <div className="border p-4 px-5 col-span-3 flex flex-col gap-1 rounded-md">
          <p className="text-sm text-gray-600 font-medium">
            Shipment value for this month
          </p>
          <p className="font-semibold text-3xl">₦0</p>
        </div>
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

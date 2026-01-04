import useBreakpointBelow from "@/hooks/use-breakpoint";
import { useGetPaymentStatsQuery } from "@/services/payment.service";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipContentProps,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

const formatNaira = (value: number) => {
  const units = ["", "k", "m", "b", "t"];
  let unitIndex = 0;
  let scaled = value;

  while (scaled >= 1000 && unitIndex < units.length - 1) {
    scaled /= 1000;
    unitIndex++;
  }

  return `₦${scaled.toFixed(scaled < 10 && unitIndex > 0 ? 1 : 0)}${
    units[unitIndex]
  }`;
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipContentProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
        <p className="font-semibold text-sm mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: ₦{entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PaymentChart = () => {
  const belowSm = useBreakpointBelow("sm");
  const { data } = useGetPaymentStatsQuery();
  const paymentStats = data?.data || [];

  return (
    <div>
      <ResponsiveContainer width="100%" height={belowSm ? 300 : 400}>
        <LineChart
          data={paymentStats}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            tickFormatter={(value) => formatNaira(value)}
          />
          <Tooltip content={(props) => <CustomTooltip {...props} />} />
          <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />
          <Line
            type="monotone"
            dataKey="currentAmount"
            stroke="#3b82f6"
            strokeWidth={2.5}
            name="Current Year"
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="previousAmount"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Previous Year"
            dot={{ fill: "#94a3b8", r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentChart;

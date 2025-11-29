import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

interface IMetricPill {
  title: React.ReactNode;
  content: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
  contentCls?: string;
  isLoading?: boolean;
}

const MetricPill = ({
  title,
  className,
  content,
  icon,
  isLoading,
  contentCls,
}: IMetricPill) => {
  return (
    <div
      className={cn("flex items-center justify-between gap-5 px-5", className)}
    >
      <div className="flex flex-col gap-[2px] flex-1">
        <p className="text-sm">{title}</p>
        {isLoading ? (
          <Skeleton className="h-5 w-[7rem] mt-[8px]" />
        ) : (
          <p className={cn("font-semibold text-[1.2rem]", contentCls)}>
            {content}
          </p>
        )}
      </div>
      <div className="text-gray-500">{icon}</div>
    </div>
  );
};

export default MetricPill;

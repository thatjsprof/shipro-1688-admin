import { useAppSelector } from "@/store/hooks";
import { useMemo } from "react";

const useRate = () => {
  const rates = useAppSelector((state) => state.app.rates);
  const cnyRates = useMemo(() => {
    const cny = rates.find((r) => r.name === "CNY/NGN");
    return cny;
  }, [rates.length]);

  return {
    cnyRates: cnyRates?.baseToConverted ?? 1,
  };
};

export default useRate;

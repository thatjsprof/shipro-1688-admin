import { useAppSelector } from "@/store/hooks";
import { useMemo } from "react";

const useRate = () => {
  const rates = useAppSelector((state) => state.app.rates);

  const { cnyRates, usdRates } = useMemo(() => {
    const cny = rates.find(
      (r) => r.baseCurrency === "CNY" && r.convertedCurrency === "NGN"
    );
    const usd = rates.find(
      (r) => r.baseCurrency === "USD" && r.convertedCurrency === "NGN"
    );
    return {
      cnyRates: cny?.baseToConverted ?? 1,
      usdRates: usd?.baseToConverted ?? 1,
    };
  }, [rates]);

  return {
    cnyRates,
    usdRates,
  };
};

export default useRate;

import { useAppSelector } from "@/store/hooks";
import { useMemo } from "react";

const useRate = () => {
  const rates = useAppSelector((state) => state.app.rates);

  const { cnyRates, usdRates, hasUsdRate } = useMemo(() => {
    const cny = rates.find(
      (r) => r.baseCurrency === "CNY" && r.convertedCurrency === "NGN"
    );
    const usd = rates.find(
      (r) => r.baseCurrency === "USD" && r.convertedCurrency === "NGN"
    );
    const usdValue = usd?.baseToConverted;
    return {
      cnyRates: cny?.baseToConverted ?? 1,
      usdRates: usdValue && usdValue > 0 ? usdValue : 0,
      hasUsdRate: !!(usdValue && usdValue > 0),
    };
  }, [rates]);

  return {
    cnyRates,
    usdRates,
    hasUsdRate,
  };
};

export default useRate;

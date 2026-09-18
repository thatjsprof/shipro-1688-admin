import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { NumericFormat } from "react-number-format";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/toast";
import {
  useCreateRateMutation,
  useLazyGetRatesQuery,
  useUpdateRateMutation,
} from "@/services/rate.service";
import { Icons } from "@/components/shared/icons";
import { useUpdateSettingMutation } from "@/services/management.service";
import { IRate, ISetting } from "@/interfaces/app.interface";
import { setRates } from "@/store/app";

type ShippingSetting = Pick<
  ISetting,
  "hkPrice" | "gzPrice" | "cbmPrice" | "clearanceFee"
>;

type CurrencyPairKey = "CNY/NGN" | "USD/NGN";

const CURRENCY_PAIRS: {
  key: CurrencyPairKey;
  baseCurrency: string;
  convertedCurrency: string;
  label: string;
}[] = [
  {
    key: "CNY/NGN",
    baseCurrency: "CNY",
    convertedCurrency: "NGN",
    label: "CNY/NGN",
  },
  {
    key: "USD/NGN",
    baseCurrency: "USD",
    convertedCurrency: "NGN",
    label: "USD/NGN",
  },
];

const names: Record<keyof ShippingSetting, string> = {
  hkPrice: "HK Price",
  gzPrice: "GZ Price",
  cbmPrice: "CBM Price",
  clearanceFee: "Clearance Fee",
};

const Rates = () => {
  const dispatch = useAppDispatch();
  const rates = useAppSelector((state) => state.app.rates);
  const settings = useAppSelector((state) => state.app.setting);
  const [updateRate] = useUpdateRateMutation();
  const [createRate] = useCreateRateMutation();
  const [getRates] = useLazyGetRatesQuery();
  const [updateSetting, { isLoading: loadingSetting }] =
    useUpdateSettingMutation();
  const [setting, setSetting] = useState<
    Partial<Record<keyof ShippingSetting, string>>
  >({});
  const [value, setValue] = useState<Record<CurrencyPairKey, string>>({
    "CNY/NGN": "",
    "USD/NGN": "",
  });
  const [loadingCurrency, setLoadingCurrency] = useState(false);

  const ratesByPair = useMemo(() => {
    return rates.reduce(
      (acc, rate) => {
        const key = `${rate.baseCurrency}/${rate.convertedCurrency}` as
          | CurrencyPairKey
          | string;
        acc[key] = rate;
        return acc;
      },
      {} as Record<string, IRate>
    );
  }, [rates]);

  const refreshRates = async () => {
    const response = await getRates().unwrap();
    if (response.status === 200) {
      dispatch(setRates(response.data));
    }
  };

  const handleCurrencySave = async () => {
    try {
      setLoadingCurrency(true);

      for (const pair of CURRENCY_PAIRS) {
        const nextValue = value[pair.key];
        if (!nextValue || Number(nextValue) <= 0) {
          notify(`Enter a valid ${pair.label} rate`);
          return;
        }

        const existing = ratesByPair[pair.key];
        if (existing?.id) {
          await updateRate({
            id: existing.id,
            baseToConverted: +nextValue,
          }).unwrap();
        } else {
          await createRate({
            baseCurrency: pair.baseCurrency,
            convertedCurrency: pair.convertedCurrency,
            baseToConverted: +nextValue,
          }).unwrap();
        }
      }

      await refreshRates();
      notify("Currency rates updated");
    } catch {
      notify("Failed to update currency rates");
    } finally {
      setLoadingCurrency(false);
    }
  };

  const handleSettingSave = async () => {
    try {
      const response = await updateSetting({
        hkPrice: +(setting.hkPrice ?? 0),
        gzPrice: +(setting.gzPrice ?? 0),
        cbmPrice: +(setting.cbmPrice ?? 0),
        clearanceFee: +(setting.clearanceFee ?? 0),
      }).unwrap();
      if (response.status === 200) {
        notify(response.message);
      }
    } catch {
      notify("Failed to update rate");
    }
  };

  useEffect(() => {
    setValue({
      "CNY/NGN": ratesByPair["CNY/NGN"]?.baseToConverted?.toString() ?? "",
      "USD/NGN": ratesByPair["USD/NGN"]?.baseToConverted?.toString() ?? "",
    });
  }, [ratesByPair]);

  useEffect(() => {
    setSetting({
      hkPrice: settings?.hkPrice?.toString() ?? "",
      gzPrice: settings?.gzPrice?.toString() ?? "",
      cbmPrice: settings?.cbmPrice?.toString() ?? "",
      clearanceFee: settings?.clearanceFee?.toString() ?? "",
    });
  }, [settings]);

  return (
    <div className="mt-6 max-w-xl">
      <div>
        <p className="font-semibold mb-4">Currency Rates</p>
        <div className="flex flex-col gap-3">
          {CURRENCY_PAIRS.map((pair) => (
            <div className="flex items-center gap-4" key={pair.key}>
              <p className="w-24 shrink-0">{pair.label}</p>
              <NumericFormat
                type="text"
                name={pair.key}
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="Base to Converted"
                displayType="input"
                decimalSeparator="."
                allowNegative={false}
                thousandSeparator=","
                value={value[pair.key]}
                onValueChange={(values) => {
                  setValue((prev) => ({
                    ...prev,
                    [pair.key]: values.value,
                  }));
                }}
                className="h-10 w-full"
                customInput={Input}
              />
            </div>
          ))}
          <Button
            className="shadow-none h-10 w-fit mt-2 font-semibold"
            onClick={handleCurrencySave}
            disabled={loadingCurrency}
          >
            {loadingCurrency && (
              <Icons.spinner className="h-3 w-3 animate-spin" />
            )}
            Save
          </Button>
        </div>
      </div>
      <div className="mt-10">
        <p className="font-semibold mb-4">Shipping Rates</p>
        <div className="flex flex-col gap-3">
          {Object.entries(setting).map(([key]) => {
            const keyToUse = key as keyof ShippingSetting;
            return (
              <div className="flex items-center gap-2" key={key}>
                <div className="flex items-center gap-4 flex-1">
                  <p className="text-nowrap">{names[keyToUse]}</p>
                  <NumericFormat
                    type="text"
                    name="packageWeight"
                    autoCapitalize="none"
                    autoCorrect="off"
                    placeholder={names[keyToUse]}
                    displayType="input"
                    decimalSeparator="."
                    allowNegative={false}
                    thousandSeparator=","
                    value={setting[keyToUse]}
                    onValueChange={(values) => {
                      setSetting((prev) => {
                        const toUpdate = { ...prev };
                        toUpdate[keyToUse] = values.value;
                        return toUpdate;
                      });
                    }}
                    className="h-10 w-full"
                    customInput={Input}
                  />
                </div>
              </div>
            );
          })}
          <Button
            className="shadow-none h-10 w-fit mt-5 font-semibold"
            onClick={handleSettingSave}
            disabled={loadingSetting}
          >
            {loadingSetting && (
              <Icons.spinner className="h-3 w-3 animate-spin" />
            )}
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Rates;

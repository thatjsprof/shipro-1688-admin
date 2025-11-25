import { useAppSelector } from "@/store/hooks";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import { Button } from "../ui/button";
import { notify } from "@/lib/toast";
import { useUpdateRateMutation } from "@/services/rate.service";
import { Icons } from "../shared/icons";
import { useUpdateSettingMutation } from "@/services/management.service";
import { ISetting } from "@/interfaces/app.interface";

const names: Record<string, string> = {
  hkPrice: "HK Price",
  gzPrice: "GZ Price",
};

const Rates = () => {
  const rates = useAppSelector((state) => state.app.rates);
  const settings = useAppSelector((state) => state.app.setting);
  const [updateRate] = useUpdateRateMutation();
  const [updateSetting, { isLoading: loadingSetting }] =
    useUpdateSettingMutation();
  const [setting, setSetting] = useState<
    Partial<Record<keyof ISetting, string>>
  >({});
  const [value, setValue] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const updateLoading = (id: string, val: boolean) => {
    setIsLoading((prev) => ({
      ...prev,
      [id]: val,
    }));
  };

  const handleSave = async (id: string) => {
    try {
      updateLoading(id, true);
      const response = await updateRate({
        id,
        baseToConverted: +value[id],
      }).unwrap();
      if (response.status === 200) {
        notify(response.message);
        updateLoading(id, false);
      }
    } catch (err) {
      notify("Failed to update rate");
    } finally {
      updateLoading(id, false);
    }
  };

  const handleSettingSave = async () => {
    try {
      const response = await updateSetting({
        hkPrice: +(setting.hkPrice ?? 0),
        gzPrice: +(setting.gzPrice ?? 0),
      }).unwrap();
      if (response.status === 200) {
        notify(response.message);
      }
    } catch (err) {
      notify("Failed to update rate");
    }
  };

  useEffect(() => {
    const toSave = Object.values(rates).reduce((acc, cur) => {
      acc[cur.id] = cur.baseToConverted.toString();
      return acc;
    }, {} as Record<string, string>);
    setValue(toSave);
  }, [rates.length]);

  useEffect(() => {
    const setting = {
      hkPrice: settings?.hkPrice.toString() ?? "",
      gzPrice: settings?.gzPrice.toString() ?? "",
    };
    const toSave = Object.entries(setting).reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    setSetting(toSave);
  }, [settings]);

  return (
    <div className="mt-6 max-w-xl">
      <div>
        <p className="font-semibold mb-4">Currency Rates</p>
        {rates.map((rate) => {
          return (
            <div className="flex items-center gap-2" key={rate.id}>
              <div className="flex items-center gap-4 flex-1">
                <p>{rate.name}</p>
                <NumericFormat
                  type="text"
                  name="packageWeight"
                  autoCapitalize="none"
                  autoCorrect="off"
                  placeholder="Base to Converted"
                  displayType="input"
                  decimalSeparator="."
                  allowNegative={false}
                  thousandSeparator=","
                  value={value[rate.id]}
                  onValueChange={(values) => {
                    setValue((prev) => {
                      const toUpdate = { ...prev };
                      toUpdate[rate.id] = values.value;
                      return toUpdate;
                    });
                  }}
                  className="h-10 w-full"
                  customInput={Input}
                />
              </div>
              <Button
                className="shadow-none h-10"
                onClick={() => handleSave(rate.id)}
                disabled={isLoading[rate.id]}
              >
                {isLoading[rate.id] && (
                  <Icons.spinner className="h-3 w-3 animate-spin" />
                )}
                Save
              </Button>
            </div>
          );
        })}
      </div>
      <div className="mt-10">
        <p className="font-semibold mb-4">Shipping Rates</p>
        <div className="flex flex-col gap-3">
          {Object.entries(setting).map(([key]) => {
            const keyToUse = key as keyof ISetting;
            return (
              <div className="flex items-center gap-2" key={key}>
                <div className="flex items-center gap-4 flex-1">
                  <p className="text-nowrap">{names[key]}</p>
                  <NumericFormat
                    type="text"
                    name="packageWeight"
                    autoCapitalize="none"
                    autoCorrect="off"
                    placeholder="Base to Converted"
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
            className="shadow-none h-10 w-fit mt-5"
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

import { Spinner } from "@/components/ui/spinner";
import { IUserRole } from "@/interfaces/user.interface";
import { useLazyGetSettingsQuery } from "@/services/management.service";
import {
  useGetRatesQuery,
  useLazyGetRatesQuery,
} from "@/services/rate.service";
import { useLazyGetProfileQuery } from "@/services/user.service";
import { setRates, setSetting } from "@/store/app";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setAuthenticationState } from "@/store/user";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [getUser] = useLazyGetProfileQuery();
  const [getRates] = useLazyGetRatesQuery();
  const [getSettings] = useLazyGetSettingsQuery();
  const [loading, setLoading] = useState(true);
  const id = useAppSelector((state) => state.user.user?.id);

  async function fetchUser() {
    try {
      const res = await getUser().unwrap();
      if (res.session) {
        const data = res.user;
        if (data.role === IUserRole.admin) {
          dispatch(
            setAuthenticationState({
              authenticated: true,
              user: data,
            })
          );
        } else {
          dispatch(setAuthenticationState(null));
          router.push("/login");
        }
      } else {
        dispatch(setAuthenticationState(null));
      }
    } catch {
      dispatch(setAuthenticationState(null));
    } finally {
      setLoading(false);
    }
  }

  async function fetchAdminSettings() {
    const response = await getRates().unwrap();
    if (response.status === 200) {
      dispatch(setRates(response.data));
    }
    const responseSetting = await getSettings().unwrap();
    if (responseSetting.status === 200) {
      dispatch(setSetting(responseSetting.data));
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchAdminSettings();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-6">
        <img alt="Shipro png" src="/logo-2.png" className="w-[7rem]" />
        <div className="flex items-center space-x-3 text-gray-400">
          <Spinner className="size-7" />
        </div>
      </div>
    );
  }

  return <div>{children}</div>;
};

export default AuthProvider;

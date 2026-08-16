import Password from "@/components/pages/settings/password";
import Account from "@/components/pages/settings/profile";
import Rates from "@/components/pages/settings/rates";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import { useQueryTabs } from "@/hooks/use-query-tabs";
import { useEffect } from "react";
import AccountDialog from "@/components/pages/settings/account-dialog";

enum ITabs {
  Profile = "profile",
  Password = "password",
  Rates = "rates",
  AccountDialog = "account-dialog",
}

const TAB_VALUES = [
  ITabs.Profile,
  ITabs.Rates,
  ITabs.AccountDialog,
  ITabs.Password,
];
const DEFAULT_TAB = ITabs.Profile;

const Settings = () => {
  const { activeTab, handleTabChange } = useQueryTabs({
    tabValues: TAB_VALUES,
    defaultValue: DEFAULT_TAB,
  });

  useEffect(() => {
    document.title = `Settings | Shipro Africa`;
  }, []);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-7">
      <TabsList>
        <TabsTrigger value={ITabs.Profile}>Profile</TabsTrigger>
        <TabsTrigger value={ITabs.Password}>Password</TabsTrigger>
        <TabsTrigger value={ITabs.Rates}>Rates</TabsTrigger>
        <TabsTrigger value={ITabs.AccountDialog}>Account dialog</TabsTrigger>
      </TabsList>
      <TabsContent value={ITabs.Profile}>
        <Account />
      </TabsContent>
      <TabsContent value={ITabs.Password}>
        <Password />
      </TabsContent>
      <TabsContent value={ITabs.Rates}>
        <Rates />
      </TabsContent>
      <TabsContent value={ITabs.AccountDialog}>
        <AccountDialog />
      </TabsContent>
    </Tabs>
  );
};

export default Settings;

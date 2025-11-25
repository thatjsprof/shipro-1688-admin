import Rates from "@/components/settings/rates";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import { useQueryTabs } from "@/hooks/use-query-tabs";

enum ITabs {
  Profile = "profile",
  Rates = "rates",
}

const TAB_VALUES = [ITabs.Profile, ITabs.Rates];
const DEFAULT_TAB = ITabs.Profile;

const Settings = () => {
  const { activeTab, handleTabChange } = useQueryTabs({
    tabValues: TAB_VALUES,
    defaultValue: DEFAULT_TAB,
  });

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value={ITabs.Profile}>Profile</TabsTrigger>
        <TabsTrigger value={ITabs.Rates}>Rates</TabsTrigger>
      </TabsList>
      <TabsContent value={ITabs.Profile}>
        <div className="py-6 text-sm text-muted-foreground">
          Profile settings coming soon.
        </div>
      </TabsContent>
      <TabsContent value={ITabs.Rates}>
        <Rates />
      </TabsContent>
    </Tabs>
  );
};

export default Settings;

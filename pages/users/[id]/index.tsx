import Wallet from "@/components/pages/users/wallet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryTabs } from "@/hooks/use-query-tabs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

enum ITabs {
  Basic = "basic",
  Wallet = "wallet",
}

const TAB_VALUES = [ITabs.Basic, ITabs.Wallet];
const DEFAULT_TAB = ITabs.Basic;

const User = () => {
  const { activeTab, handleTabChange } = useQueryTabs({
    tabValues: TAB_VALUES,
    defaultValue: DEFAULT_TAB,
  });

  useEffect(() => {
    document.title = `Users | Shipro Africa`;
  }, []);

  return (
    <div className="py-8">
      <Link href="/users">
        <div className="flex items-center gap-2 text-gray-500 mb-6 text-sm cursor-pointer w-fit">
          <ArrowLeft className="size-5" />
          Back to Users
        </div>
      </Link>
      <h1 className="text-2xl font-semibold mb-8">User Information</h1>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value={ITabs.Basic}>Basic</TabsTrigger>
          <TabsTrigger value={ITabs.Wallet}>Wallet</TabsTrigger>
        </TabsList>
        <TabsContent value={ITabs.Basic}>
          <div className="py-6 text-sm text-muted-foreground">
            Profile settings coming soon.
          </div>
        </TabsContent>
        <TabsContent value={ITabs.Wallet}>
          <Wallet />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default User;

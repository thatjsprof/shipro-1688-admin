import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import { isRouteMatch } from "@/lib/utils";
import StoreProvider from "@/providers/store.provider";
import AppLayout from "@/layouts/app.layout";
import "@/styles/globals.css";
import AuthProvider from "@/providers/auth.provider";
import { PropsWithChildren } from "react";

const AppMainLayout = ({ children }: PropsWithChildren) => {
  return (
    <AuthProvider>
      <AppLayout>{children}</AppLayout>
    </AuthProvider>
  );
};

const Layout = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const currentPath = router.pathname;

  const isAppRoute = APP_ROUTES.some((route) =>
    isRouteMatch(currentPath, route)
  );
  if (isAppRoute) {
    return <AppMainLayout>{children}</AppMainLayout>;
  }
  return <>{children}</>;
};

const APP_ROUTES = [
  "/dashboard",
  "/orders",
  "/settings",
  "/products",
  "/users",
  "/payments",
];

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <title>Shipro Admin</title>
      <meta
        name="description"
        content="Shipro Admin - Manage activity on shipro"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:title"
        content="Shipro Admin - Manage activity on shipro"
      />
      <meta
        name="twitter:description"
        content="Shipro Admin - Manage activity on shipro"
      />
      <meta
        name="twitter:image"
        content="https://admin.shipro.africa/adminshipro.png"
      />
      <meta name="twitter:site" content="@shiproafrica" />
      <meta
        property="og:title"
        content="Shipro Admin - Manage activity on shipro"
      />
      <meta
        property="og:description"
        content="Shipro Admin - Manage activity on shipro"
      />
      <meta
        property="og:image"
        content="https://admin.shipro.africa/adminshipro.png"
      />
      <meta property="og:url" content="https://admin.shipro.africa" />
      <meta property="og:type" content="website" />
      <StoreProvider>
        <Layout>
          <main>
            <Component {...pageProps} />
          </main>
        </Layout>
        <Toaster position="top-right" containerClassName="text-[.85rem]" />
      </StoreProvider>
    </>
  );
}

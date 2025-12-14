import { authApi, userApi } from "@/services/user.service";
import {
  Action,
  combineReducers,
  configureStore,
  Reducer,
} from "@reduxjs/toolkit";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import appSlice from "./app";
import userSlice from "./user";
import { orderApi } from "@/services/order.service";
import { rateApi } from "@/services/rate.service";
import { settingApi } from "@/services/management.service";
import { productApi } from "@/services/product.service";
import { walletApi } from "@/services/wallet.service";
import { cartApi } from "@/services/cart.service";
import { paymentApi } from "@/services/payment.service";
import { rmbApi } from "@/services/rmb.service";

const rootPersistConfig = {
  key: "admin:root",
  storage,
  whitelist: [],
};

const appPersistConfig = {
  key: "admin:app",
  storage,
  blacklist: [],
};

const allReducers = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
  [walletApi.reducerPath]: walletApi.reducer,
  [cartApi.reducerPath]: cartApi.reducer,
  [rmbApi.reducerPath]: rmbApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [rateApi.reducerPath]: rateApi.reducer,
  [productApi.reducerPath]: productApi.reducer,
  [orderApi.reducerPath]: orderApi.reducer,
  [settingApi.reducerPath]: settingApi.reducer,
  [userSlice.name]: userSlice.reducer,
  [appSlice.name]: persistReducer(appPersistConfig, appSlice.reducer),
});

const rootReducer: Reducer<RootState> = (
  state: RootState | undefined,
  action: Action
) => {
  if (action.type === "auth/setLogout") {
    // storage.removeItem("persist:root");
  }

  return allReducers(state, action);
};

const store = () =>
  configureStore({
    reducer: persistReducer(rootPersistConfig, rootReducer),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      })
        .concat(userApi.middleware)
        .concat(paymentApi.middleware)
        .concat(authApi.middleware)
        .concat(cartApi.middleware)
        .concat(walletApi.middleware)
        .concat(rmbApi.middleware)
        .concat(rateApi.middleware)
        .concat(productApi.middleware)
        .concat(settingApi.middleware)
        .concat(orderApi.middleware),
    devTools: process.env.ENVIRONMENT !== "production",
  });

export type AppStore = ReturnType<typeof store>;
export type RootState = ReturnType<typeof allReducers>;
export type AppDispatch = AppStore["dispatch"];
export default store;

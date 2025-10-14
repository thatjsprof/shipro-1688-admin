import { userApi } from "@/services/user.service";
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

const rootPersistConfig = {
  key: "root",
  storage,
  whitelist: [],
};

const appPersistConfig = {
  key: "app",
  storage,
  blacklist: [],
};

const allReducers = combineReducers({
  [userApi.reducerPath]: userApi.reducer,
  [orderApi.reducerPath]: orderApi.reducer,
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
        .concat(orderApi.middleware),
    devTools: process.env.ENVIRONMENT !== "production",
  });

export type AppStore = ReturnType<typeof store>;
export type RootState = ReturnType<typeof allReducers>;
export type AppDispatch = AppStore["dispatch"];
export default store;

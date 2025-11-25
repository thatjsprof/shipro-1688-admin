import { IRate, ISetting } from "@/interfaces/app.interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IAppState {
  rates: IRate[];
  setting: ISetting | null;
}

const initialState: IAppState = {
  rates: [],
  setting: null,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setRates: (state, action: PayloadAction<IRate[]>) => {
      state.rates = action.payload;
    },
    setSetting: (state, action: PayloadAction<ISetting | null>) => {
      state.setting = action.payload;
    },
  },
  extraReducers: () => {},
});

export const { setRates, setSetting } = appSlice.actions;
export default appSlice;

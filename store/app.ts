import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IAppState {}

const initialState: IAppState = {};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {},
  extraReducers: () => {},
});

export const {} = appSlice.actions;
export default appSlice;

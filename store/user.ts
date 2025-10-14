import { IUser } from "@/interfaces/user.interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  user: IUser | null;
  authenticated: boolean;
}

const initialState: UserState = {
  user: null,
  authenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAuthenticationState: (
      state,
      action: PayloadAction<{
        user?: Partial<IUser> | null;
        authenticated?: boolean;
      } | null>
    ) => {
      if (!action.payload) {
        state.authenticated = false;
        state.user = null;
        return;
      }
      if (action.payload.user)
        state.user = {
          ...state.user,
          ...(action.payload.user as IUser),
        };
      if (
        action.payload.authenticated !== undefined &&
        action.payload.authenticated !== null
      )
        state.authenticated = action.payload.authenticated;
    },
    setLogout: (state) => {
      state.user = null;
      state.authenticated = false;
    },
  },
  extraReducers: (builder) => {},
});

export const { setAuthenticationState, setLogout } = userSlice.actions;

export default userSlice;

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
      if (action.payload === null) {
        state.authenticated = false;
        state.user = null;
        return;
      }
      const { user, authenticated } = action.payload;
      if (user === null) {
        state.user = null;
      } else if (user !== undefined) {
        state.user = {
          ...state.user,
          ...(user as IUser),
        };
      }
      if (authenticated !== undefined && authenticated !== null) {
        state.authenticated = authenticated;
      }
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

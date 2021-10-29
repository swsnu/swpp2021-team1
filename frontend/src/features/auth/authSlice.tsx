import {
    createAsyncThunk,
    createSlice,
    PayloadAction,
    SliceCaseReducers,
} from "@reduxjs/toolkit";
import { IUser } from "../../common/Interfaces";
import {
    getSession, getUser, postSignIn, postUsers,
} from "../../common/APIs";

export const signIn = createAsyncThunk<IUser, {username : string, password : string}>(
    "auth/signin", // action type
    async ({ username, password }, thunkAPI) => // payload creator
        await postSignIn(username, password),

);

export const signUp = createAsyncThunk<IUser, IUser>(
    "auth/signup",
    async (user, thunkAPI) => // payload creator
        await postUsers(user),

);

export const fetchUser = createAsyncThunk<IUser, string>(
    "auth/user",
    async (username, thunkAPI) => await getUser(username),
);

export const fetchSession = createAsyncThunk<IUser, void>(
    "auth/session",
    async (thunkAPI) => await getSession(),
);

interface AuthState {
    isLoading : boolean;
    hasError : boolean;
    account : IUser|null;
    currentUser : IUser|null;
}

export const authInitialState: AuthState = {
    isLoading: true,
    hasError: false,
    account: null,
    currentUser: null,
};

const authSlice = createSlice<AuthState, SliceCaseReducers<AuthState>>({
    name: "auth",
    initialState: authInitialState,
    reducers: {
        toBeLoaded: (state) => {
            state.isLoading = true;
        },
        handleError: (state) => {
            state.hasError = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(signIn.pending, (state: AuthState) => {
            state.isLoading = true;
            state.hasError = false;
        });

        builder.addCase(signIn.fulfilled, (state: AuthState, action : PayloadAction<IUser>) => {
            state.isLoading = false;
            state.hasError = false;
            state.account = action.payload;
            state.currentUser = action.payload;
        });

        builder.addCase(signIn.rejected, (state: AuthState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(fetchSession.pending, (state : AuthState) => {
            state.isLoading = true;
            state.hasError = false;
        });

        builder.addCase(fetchSession.fulfilled, (state: AuthState, action : PayloadAction<IUser>) => {
            state.isLoading = false;
            state.hasError = false;
            state.account = action.payload;
        });

        builder.addCase(signUp.pending, (state: AuthState) => {
            state.isLoading = true;
            state.hasError = false;
        });

        builder.addCase(signUp.fulfilled, (state: AuthState, action : PayloadAction<IUser>) => {
            state.isLoading = false;
            state.hasError = false;
            state.account = action.payload;
            state.currentUser = action.payload;
        });

        builder.addCase(signUp.rejected, (state: AuthState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(fetchUser.pending, (state: AuthState) => {
            state.isLoading = true;
            state.hasError = false;
        });

        builder.addCase(fetchUser.fulfilled,
            (state: AuthState, action : PayloadAction<IUser>) => {
                state.isLoading = false;
                state.hasError = false;
                state.currentUser = action.payload;
            });

        builder.addCase(fetchUser.rejected, (state: AuthState) => {
            state.isLoading = false;
            state.hasError = true;
        });
    },
});

export type { AuthState };
export const { toBeLoaded, handleError } = authSlice.actions;
export default authSlice.reducer;

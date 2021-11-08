import {
    createAsyncThunk,
    createSlice,
    PayloadAction,
    SliceCaseReducers,
} from "@reduxjs/toolkit";
import { IUser } from "../../common/Interfaces";
import {
    getSession, getSignOut, getUser, postFriends, postSignIn, postUsers,
} from "../../common/APIs";
import store, { RootState } from "../../app/store";

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

export const signOut = createAsyncThunk<void, void>(
    "auth/signout",
    async (thunkAPI) =>
        await getSignOut(),
);

export const addFriend = createAsyncThunk<IUser, string, {state: RootState}>(
    "auth/addfriend",
    async (friendUsername, thunkAPI) => {
        const { auth: { account } } = thunkAPI.getState();
        await postFriends(account?.username as string, friendUsername);
        const friendObject = await getUser(friendUsername);
        return friendObject;
    },
);

export const switchCurrentUser = createAsyncThunk<IUser,
string, {state: RootState}>(
    "auth/switchCurrentUser",
    async (username, thunkAPI) => {
        const { auth: { account } } = thunkAPI.getState();
        if (username === account?.username) return account;
        return await getUser(username);
    },
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

        builder.addCase(fetchSession.rejected, (state: AuthState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(signUp.pending, (state: AuthState) => {
            state.isLoading = true;
            state.hasError = false;
        });

        builder.addCase(signUp.fulfilled, (state: AuthState, action : PayloadAction<IUser>) => {
            state.isLoading = false;
            state.hasError = false;
            // state.account = action.payload;
            // state.currentUser = action.payload;
        });

        builder.addCase(signUp.rejected, (state: AuthState) => {
            state.isLoading = false;
            state.hasError = true;
        });
        builder.addCase(signOut.fulfilled, (state: AuthState) => {
            state.account = null;
            state.currentUser = null;
        });
        builder.addCase(switchCurrentUser.pending, (state) => {
            state.isLoading = true;
        });

        builder.addCase(switchCurrentUser.fulfilled, (state: AuthState, action: PayloadAction<IUser>) => {
            state.currentUser = action.payload;
            state.isLoading = false;
            state.hasError = false;
        });
        builder.addCase(switchCurrentUser.rejected, (state) => {
            state.currentUser = null;
            state.isLoading = false;
            state.hasError = true;
        });
        builder.addCase(addFriend.fulfilled, (state: AuthState, action: PayloadAction<IUser>) => {
            const friendObject = action.payload;
            if (state.account?.friends) state.account?.friends.push(friendObject);
            if (state.currentUser?.username === friendObject.username) {
                if (state.currentUser?.friends && state.account) state.currentUser?.friends.push(state.account);
            }
        });
    },
});

export type { AuthState };
export const { toBeLoaded, handleError } = authSlice.actions;
export default authSlice.reducer;

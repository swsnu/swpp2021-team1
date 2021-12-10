import {
    createAsyncThunk, createSlice, PayloadAction, SliceCaseReducers,
} from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import {
    deleteFriends,
    getSession, getSignOut, getUser, postFriends, postSignIn, postUsers, putUser,
} from "../../common/APIs";
import { IUser, UserProfileType } from "../../common/Interfaces";

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

export const addFriend = createAsyncThunk<
void,
{username: string, fusername: string}>(
    "auth/addfriend",
    async ({ username, fusername }) => {
        await postFriends(username, fusername);
    },
);

export const unfriend = createAsyncThunk<void, { username: string, fusername: string }>(
    "auth/unfriend",
    async ({ username, fusername }) => {
        await deleteFriends(username, fusername);
    },
);

export const switchCurrentUser = createAsyncThunk<IUser,
string, {state: {auth: AuthState}}>(
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

interface IProfileForm {
    // TODO: profile picture, visibility
    email: string,
    real_name: string,
    bio: string,
    password: string
}

export const updateProfile = createAsyncThunk<IProfileForm, IProfileForm, {state: RootState}>(
    "auth/updateProfile",
    async (form, thunkAPI) => {
        const { auth }: {auth: AuthState} = thunkAPI.getState();
        const { account } = auth;
        if (account) {
            await putUser({
                username: account.username,
                visibility: account.visibility,
                email: form.email,
                real_name: form.real_name,
                bio: form.bio,
                password: form.password,
            });
        }
        return form;
    },
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

export const authSlice = createSlice<AuthState, SliceCaseReducers<AuthState>>({
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
            if (state.account) state.isLoading = false;
            else state.isLoading = true;
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

        builder.addCase(signUp.fulfilled, (state: AuthState) => {
            state.isLoading = false;
            state.hasError = false;
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
        builder.addCase(addFriend.fulfilled, (state: AuthState) => {
            if (!state.currentUser) return;
            state.currentUser.friend_status = UserProfileType.REQUEST_SENDED;
        });
        builder.addCase(unfriend.fulfilled, (state: AuthState) => {
            if (!state.currentUser) return;
            if (!state.currentUser.friends) return;
            state.currentUser.friend_status = UserProfileType.OTHER;
            const index = state.currentUser.friends.findIndex((friend) => friend.username === state.account?.username);
            if (index < 0) return;
            state.currentUser.friends.splice(index, 1);
        });
        builder.addCase(updateProfile.fulfilled, (state: AuthState, action: PayloadAction<IProfileForm>) => {
            const {
                email, bio, real_name, password,
            } = action.payload;
            if (state.account) {
                state.account = {
                    ...state.account, email, bio, real_name, password,
                };
                if (state.currentUser) {
                    if (state.account.username === state.currentUser.username) {
                        state.currentUser = {
                            ...state.currentUser, email, bio, real_name, password,
                        };
                    }
                }
            }
        });
    },
});

export type { AuthState };
export const { toBeLoaded, handleError } = authSlice.actions;
export default authSlice.reducer;

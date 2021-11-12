import {
    createAsyncThunk,
    createSlice,
    PayloadAction,
    SliceCaseReducers,
} from "@reduxjs/toolkit";
import { IUser } from "../../common/Interfaces";
import {
    getSession, getSignOut, getUser, postFriends, postSignIn, postUsers, putUser,
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

export const signOut = createAsyncThunk<void, void>(
    "auth/signout",
    async (thunkAPI) =>
        await getSignOut(),
);

export const addFriend = createAsyncThunk<{fusername: string, myFriendList: IUser[]}, {username: string, fusername: string}>(
    "auth/addfriend",
    async ({ username, fusername }, thunkAPI) => ({
        fusername,
        myFriendList: await postFriends(username, fusername),
    }),
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

export const updateProfile = createAsyncThunk<
IProfileForm, {account: IUser, form: IProfileForm}>(
    "auth/updateProfile",
    async ({ account, form }, thunkAPI) => {
        if (account) {
            await putUser({
                ...account,
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
        builder.addCase(addFriend.fulfilled, (state: AuthState, action) => {
            if (state.account) {
                const { fusername, myFriendList } = action.payload;
                if (state.currentUser) {
                    if (state.currentUser.username === state.account.username) {
                        state.currentUser.friends = myFriendList;
                    }
                    else if (state.currentUser.username === fusername) {
                        if (state.currentUser.friends) state.currentUser.friends.push(state.account);
                    }
                }
            }
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

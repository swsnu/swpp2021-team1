import {
    createAsyncThunk,
    createSlice,
    PayloadAction,
    SliceCaseReducers
} from "@reduxjs/toolkit";
import {IDummyUser, IUser} from "../../common/Interfaces";
import {createUser, fetchDummy, fetchUser} from "../../common/APIs";
import {AsyncThunkFulfilledActionCreator} from "@reduxjs/toolkit/dist/createAsyncThunk";

export const logIn = createAsyncThunk<{user : IUser, friends : IDummyUser[]}, {email : string, password : string}>(
    'auth/logIn', // action type
    async ({email, password}, thunkAPI) => {// payload creator
        const response = await fetchUser(email, password);
        return response.data;
    }
)

export const signUp = createAsyncThunk<IUser, IUser>(
    'auth/signUp',
    async (user , thunkAPI) => {// payload creator
        const response = await createUser(user);
        return response.data;
    }
)

export const getUser = createAsyncThunk<{user : IDummyUser, friends : IDummyUser[]}, string>(
    'auth/getUser',
    async (realName, thunkAPI) => {
        const response = await fetchDummy(realName);
        return response.data;
    }
)

interface AuthState {
    isLoading : boolean;
    hasError : boolean;
    account : IUser|null;
    currentUser : IDummyUser|null;
    friends : IDummyUser[];
}

export const authInitialState: AuthState = {
    isLoading : true,
    hasError : false,
    account : null,
    currentUser : null,
    friends : []
}

const authSlice = createSlice<AuthState, SliceCaseReducers<AuthState>>({
    name: 'auth',
    initialState: authInitialState,
    reducers: {
        todo : (state) => {},
        toBeLoaded : state => {state.isLoading = true;}
    },
    extraReducers: builder => {
        builder.addCase(logIn.pending, (state: AuthState) => {
            state.isLoading = true;
            state.hasError = false;
        })

        builder.addCase(logIn.fulfilled, (state: AuthState, action : PayloadAction<{user : IUser, friends : IDummyUser[]}>) => {
            state.isLoading = false;
            state.hasError = false;
            state.account = action.payload.user;
            state.currentUser = action.payload.user;
            state.friends = action.payload.friends;
        })

        builder.addCase(logIn.rejected, (state: AuthState) => {
            state.isLoading = false;
            state.hasError = true;
        })

        builder.addCase(signUp.pending, (state: AuthState) => {
            state.isLoading = true;
            state.hasError = false;
        })

        builder.addCase(signUp.fulfilled, (state: AuthState, action : PayloadAction<IUser>) => {
            state.isLoading = false;
            state.hasError = false;
            state.account = action.payload;
            state.currentUser = action.payload;
            state.friends = [];
        })

        builder.addCase(signUp.rejected, (state: AuthState) => {
            state.isLoading = false;
            state.hasError = true;
        })

        builder.addCase(getUser.pending, (state: AuthState) => {
            state.isLoading = true;
            state.hasError = false;
        })

        builder.addCase(getUser.fulfilled,
            (state: AuthState, action : PayloadAction<{user : IDummyUser, friends : IDummyUser[]}>) => {
            state.isLoading = false;
            state.hasError = false;
            state.currentUser = action.payload.user;
            state.friends = action.payload.friends;
        })

        builder.addCase(getUser.rejected, (state: AuthState) => {
            state.isLoading = false;
            state.hasError = true;
        })

    }
})

export type { AuthState }
export default authSlice.reducer
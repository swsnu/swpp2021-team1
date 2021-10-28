import {
    createAsyncThunk,
    createSlice,
    PayloadAction,
    SliceCaseReducers
} from "@reduxjs/toolkit";
import {DummyUser, User} from "../../common/Interfaces";
import {createUser, fetchDummy, fetchUser} from "../../common/APIs";
import {AsyncThunkFulfilledActionCreator} from "@reduxjs/toolkit/dist/createAsyncThunk";

export const logIn = createAsyncThunk<{user : User, friends : DummyUser[]}, {email : string, password : string}>(
    'auth/logIn', // action type
    async ({email, password}, thunkAPI) => {// payload creator
        const response = await fetchUser(email, password);
        return response.data;
    }
)

export const signUp = createAsyncThunk<User, User>(
    'auth/signUp',
    async (user , thunkAPI) => {// payload creator
        const response = await createUser(user);
        return response.data;
    }
)

export const getUser = createAsyncThunk<{user : DummyUser, friends : DummyUser[]}, string>(
    'auth/getUser',
    async (real_name, thunkAPI) => {
        const response = await fetchDummy(real_name);
        return response.data;
    }
)

interface AuthState {
    isLoading : boolean;
    hasError : boolean;
    account : User|null;
    currentUser : DummyUser|null;
    friends : DummyUser[];
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
        todo : (state) => {}

    },
    extraReducers: builder => {
        builder.addCase(logIn.pending, (state: AuthState) => {
            state.isLoading = true;
            state.hasError = false;
        })

        builder.addCase(logIn.fulfilled, (state: AuthState, action : PayloadAction<{user : User, friends : DummyUser[]}>) => {
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

        builder.addCase(signUp.fulfilled, (state: AuthState, action : PayloadAction<User>) => {
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
            (state: AuthState, action : PayloadAction<{user : DummyUser, friends : DummyUser[]}>) => {
            state.isLoading = true;
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
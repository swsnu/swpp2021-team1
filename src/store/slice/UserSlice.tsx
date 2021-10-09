import {
    createAsyncThunk,
    createSlice,
    PayloadAction,
    SliceCaseReducers
} from "@reduxjs/toolkit";
import {DummyUser, User} from "../../Interfaces";
import {createUser, fetchDummy, fetchUser} from "../api/APIs";
import {AsyncThunkFulfilledActionCreator} from "@reduxjs/toolkit/dist/createAsyncThunk";

export const logIn = createAsyncThunk<{user : User, friends : DummyUser[]}, {email : string, password : string}>(
    'users/logIn', // action type
    async ({email, password}, thunkAPI) => {// payload creator
        const response = await fetchUser(email, password);
        return response.data;
    }
)

export const signUp = createAsyncThunk<User, User>(
    'users/signUp',
    async (user , thunkAPI) => {// payload creator
        const response = await createUser(user);
        return response.data;
    }
)

export const getUser = createAsyncThunk<{user : DummyUser, friends : DummyUser[]}, string>(
    'users/getUser',
    async (nickName, thunkAPI) => {
        const response = await fetchDummy(nickName);
        return response.data;
    }
)

interface UsersState {
    isLoading : boolean;
    hasError : boolean;
    account : User|null;
    currentUser : DummyUser|null;
    friends : DummyUser[];
}

export const usersInitialState : UsersState = {
    isLoading : true,
    hasError : false,
    account : null,
    currentUser : null,
    friends : []
}

const usersSlice = createSlice<UsersState, SliceCaseReducers<UsersState>>({
    name: 'users',
    initialState: usersInitialState,
    reducers: {
        todo : state => {}

    },
    extraReducers: builder => {
        builder.addCase(logIn.pending, (state : UsersState) => {
            state.isLoading = true;
            state.hasError = false;
        })

        builder.addCase(logIn.fulfilled, (state : UsersState, action : PayloadAction<{user : User, friends : DummyUser[]}>) => {
            state.isLoading = false;
            state.hasError = false;
            state.account = action.payload.user;
            state.currentUser = action.payload.user;
            state.friends = action.payload.friends;
        })

        builder.addCase(logIn.rejected, (state : UsersState) => {
            state.isLoading = false;
            state.hasError = true;
        })

        builder.addCase(signUp.pending, (state : UsersState) => {
            state.isLoading = true;
            state.hasError = false;
        })

        builder.addCase(signUp.fulfilled, (state : UsersState, action : PayloadAction<User>) => {
            state.isLoading = false;
            state.hasError = false;
            state.account = action.payload;
            state.currentUser = action.payload;
            state.friends = [];
        })

        builder.addCase(signUp.rejected, (state : UsersState) => {
            state.isLoading = false;
            state.hasError = true;
        })

        builder.addCase(getUser.pending, (state : UsersState) => {
            state.isLoading = true;
            state.hasError = false;
        })

        builder.addCase(getUser.fulfilled,
            (state : UsersState, action : PayloadAction<{user : DummyUser, friends : DummyUser[]}>) => {
            state.isLoading = true;
            state.hasError = false;
            state.currentUser = action.payload.user;
            state.friends = action.payload.friends;
        })

        builder.addCase(getUser.rejected, (state : UsersState) => {
            state.isLoading = false;
            state.hasError = true;
        })
    }
})

export type { UsersState }
export default usersSlice.reducer
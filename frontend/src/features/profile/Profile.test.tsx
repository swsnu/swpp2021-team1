import { configureStore, createSlice, SliceCaseReducers } from "@reduxjs/toolkit";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import * as router from "react-router";
import { userFactory } from "../../common/Interfaces";
import authReducer, { AuthState, authSlice } from "../auth/authSlice";
import Profile from "./Profile";

const user = userFactory();
const users = [user];

const authMocauthSlicekSlice = createSlice<AuthState, SliceCaseReducers<AuthState>>({
    name: "auth",
    initialState: {
        isLoading: true,
        hasError: false,
        account: null,
        currentUser: null,
    },
    reducers: {
        toBeLoaded: (state) => {
            state.isLoading = true;
        },
        handleError: (state) => {
            state.hasError = false;
        },
    },
    extraReducers: authSlice.
});

describe("Profile", () => {
    it("should render", async () => {
        const store = configureStore();
        let wrapper;
        await act(async () => {
            wrapper = mount(
                <Provider store={store}>
                    <BrowserRouter>
                        <Profile />
                    </BrowserRouter>
                </Provider>,
            );
        });
    });
});

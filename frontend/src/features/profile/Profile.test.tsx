import { configureStore, createSlice } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { BrowserRouter } from "react-router-dom";
import Profile from "./Profile";
import authReducer from "../auth/authSlice";

describe("Profile", () => {
    it("should render", () => {
        const store = configureStore({
            reducer: {
                auth: authReducer,
            },
        });
        const wrapper = mount(
            <Provider store={store}>
                <BrowserRouter>
                    <Profile />
                </BrowserRouter>
            </Provider>,
        );
        expect(wrapper.find(Profile).length).toBe(1);
    });
});

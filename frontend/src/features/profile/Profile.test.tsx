import { configureStore } from "@reduxjs/toolkit";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import * as router from "react-router";
import { userFactory } from "../../common/Interfaces";
import authReducer from "../auth/authSlice";
import Profile from "./Profile";

const user = userFactory();
const users = [user];

describe("Profile", () => {
    it("should render", async () => {
        const store = configureStore({
            reducer: {
                auth: authReducer,
            },
        });
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

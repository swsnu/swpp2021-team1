import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import {
    Route, Router,
} from "react-router-dom";
import React from "react";
import { mount } from "enzyme";
import axios from "axios";
import { createBrowserHistory } from "history";
import { act } from "react-dom/test-utils";
import postsReducer from "../../../post/postsSlice";
import reposReducer from "../../../repository/reposSlice";
import authReducer from "../../authSlice";
import { userFactory } from "../../../../common/Interfaces";
import SignUp from "./SignUp";
import * as APIs from "../../../../common/APIs";

const history = createBrowserHistory();
const historyMock = { ...history, push: jest.fn(), listen: jest.fn() };

function makeStoredComponent() {
    const store = configureStore({
        reducer: {
            auth: authReducer,
            repos: reposReducer,
            posts: postsReducer,
        },
    });

    return (
        <Provider store={store}>
            <Router history={historyMock}>
                <Route path="/" render={() => <SignUp show onModalClose={jest.fn} />} />
            </Router>
        </Provider>
    );
}

describe("SignUp", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("Should be able to write form", async () => {
        const spySlice = jest.spyOn(APIs, "postSignIn").mockResolvedValue(userFactory());
        jest.spyOn(APIs, "postUsers").mockResolvedValue(userFactory());
        jest.spyOn(axios, "get").mockRejectedValue(undefined);
        const component = mount(makeStoredComponent());
        component.find("FormControl").at(0).simulate("change", { target: { name: "email", value: "asdf@gmail.com" } });
        component.find("FormControl").at(1).simulate("change", { target: { name: "username", value: "test" } });
        component.find("FormControl").at(2).simulate("change", { target: { name: "realname", value: "Hello" } });
        component.find("FormControl").at(3).simulate("change", { target: { name: "password", value: "abcd1234" } });
        component.find("FormControl").at(4).simulate("change", { target: { name: "bio", value: "Hello World!" } });
        const wrapper = component.find("FormCheck");
        wrapper.at(0).find("input").simulate("change", { target: { checked: false } });
        wrapper.at(1).find("input").simulate("change", { target: { checked: false } });
        wrapper.at(2).find("input").simulate("change", { target: { checked: false } });
        await act(async () => {
            component.find("#addon").at(0).simulate("click");
        });
        await act(async () => {
            component.find("#confirm").at(0).simulate("click");
        });
        expect(spySlice).toHaveBeenCalledTimes(1);
    });
});

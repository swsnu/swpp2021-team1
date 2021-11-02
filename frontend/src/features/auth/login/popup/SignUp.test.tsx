import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import {
    BrowserRouter, Route, Router, useHistory,
} from "react-router-dom";
import React from "react";
import { mount } from "enzyme";
import * as redux from "react-redux";
import * as router from "react-router-dom";
import axios from "axios";
import { createBrowserHistory } from "history";
import { waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import SignIn from "../SignIn";
import postsReducer from "../../../post/postsSlice";
import reposReducer from "../../../repository/reposSlice";
import authReducer from "../../authSlice";
import * as actionCreator from "../../authSlice";
import { userFactory } from "../../../../common/Interfaces";
import SignUp from "./SignUp";
import * as APIs from "../../../../common/APIs";
import {wrapper} from "react-bootstrap/lib/utils/deprecationWarning";

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
        const spySlice2 = jest.spyOn(APIs, "postUsers").mockResolvedValue(userFactory());
        const spyAxios = jest.spyOn(axios, "get").mockRejectedValue(undefined);
        const component = mount(makeStoredComponent());
        component.find("FormControl").at(0).simulate("change", { target: { name: "email", value: "asdf@gmail.com" } });
        component.find("FormControl").at(1).simulate("change", { target: { name: "username", value: "abc" } });
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

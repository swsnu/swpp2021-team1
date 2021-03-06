import { Route, Router } from "react-router-dom";
import React from "react";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import * as redux from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { createBrowserHistory } from "history";
import SignIn from "./SignIn";
import * as actionCreator from "../authSlice";
import { userFactory } from "../../../common/Interfaces";
import authReducer from "../authSlice";
import reposReducer from "../../repository/reposSlice";
import postsReducer from "../../post/postsSlice";

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
                <Route path="/" exact component={SignIn} />
            </Router>
        </Provider>
    );
}

describe("SignIn", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("Should render", () => {
        const component = mount(makeStoredComponent());
        const wrapper = component.find("#viewport");
        expect(wrapper.length).toBe(1);
    });

    it("Should be able to dispatch actions", () => {
        jest.spyOn(redux, "useDispatch").mockImplementation((() =>
            () => ({
                then: (e : () => any) => e(),
            })) as typeof jest.fn);
        const spySlice = jest.spyOn(actionCreator, "signIn").mockImplementation(jest.fn);
        const component = mount(makeStoredComponent());
        component.find("FormControl").at(0).simulate("change", { target: { value: "a" } });
        component.find("FormControl").at(1).simulate("change", { target: { value: "a" } });
        const wrapper = component.find("Button");
        wrapper.at(0).simulate("click");
        expect(spySlice).toHaveBeenCalledTimes(1);
    });

    it("Should be able to click signup button", () => {
        jest.spyOn(redux, "useDispatch").mockImplementation(jest.fn);
        jest.spyOn(redux, "useSelector").mockImplementation(() => [null, false]);
        const component = mount(makeStoredComponent());
        const wrapper = component.find("Button");
        wrapper.at(1).simulate("click");
    });

    it("Should render redirect if account is not null", () => {
        jest.spyOn(redux, "useDispatch").mockImplementation(jest.fn);
        jest.spyOn(redux, "useSelector").mockImplementation(() => [userFactory(), false]);
        const component = mount(makeStoredComponent());
        const wrapper = component.find("Redirect");
        expect(wrapper.length).toBe(1);
    });
});

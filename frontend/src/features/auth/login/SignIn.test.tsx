import { BrowserRouter, Route } from "react-router-dom";
import React from "react";
import { Provider, useDispatch } from "react-redux";
import { mount } from "enzyme";
import * as redux from "react-redux";
import { Action } from "redux";
import { debug } from "util";
import { configureStore } from "@reduxjs/toolkit";
import store from "../../../app/store";
import SignIn from "./SignIn";
import * as actionCreator from "../authSlice";
import { userFactory } from "../../../common/Interfaces";
import authReducer from "../authSlice";
import reposReducer from "../../repository/reposSlice";
import postsReducer from "../../post/postsSlice";

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
            <BrowserRouter>
                <Route path="/" exact component={SignIn} />
            </BrowserRouter>
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
        const spy = jest.spyOn(redux, "useDispatch").mockImplementation(jest.fn);
        const spySlice = jest.spyOn(actionCreator, "signIn").mockImplementation(jest.fn);
        const component = mount(makeStoredComponent());
        component.find("FormControl").at(0).simulate("change", { target: { value: "a" } });
        component.find("FormControl").at(1).simulate("change", { target: { value: "a" } });
        const wrapper = component.find("Button");
        wrapper.at(0).simulate("click");
        expect(spySlice).toHaveBeenCalledTimes(1);
    });

    it("Should be able to click signup button", () => {
        const spy = jest.spyOn(redux, "useDispatch").mockImplementation(jest.fn);
        const spySelect = jest.spyOn(redux, "useSelector").mockImplementation(() => [null, false]);
        const component = mount(makeStoredComponent());
        const wrapper = component.find("Button");
        wrapper.at(1).simulate("click");
    });

    it("Should render redirect if account is not null", () => {
        const spy = jest.spyOn(redux, "useDispatch").mockImplementation(jest.fn);
        const spySelect = jest.spyOn(redux, "useSelector").mockImplementation(() => [userFactory(), false]);
        const component = mount(makeStoredComponent());
        const wrapper = component.find("#viewport");
        expect(wrapper.length).toBe(0);
    });
});

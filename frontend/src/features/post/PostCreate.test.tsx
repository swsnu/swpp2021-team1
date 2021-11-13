import { configureStore } from "@reduxjs/toolkit";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import React, { Component } from "react";
import { Provider } from "react-redux";
import { Route, Router } from "react-router";
import { BrowserRouter } from "react-router-dom";
import Factory from "../../mocks/dataGenerator";

import server from "../../mocks/server";
import Photo from "../photo/Photo";
import PCPhotoSelect from "./PCPhotoSelect";
import Post from "./Post";
import Postcreate from "./PostCreate";
import postsReducer from "./postsSlice";
import authReducer from "../auth/authSlice";

const fact = new Factory();

const history = createBrowserHistory();
const historyMock = { ...history, push: jest.fn(), listen: jest.fn() };
describe("PostCreate", () => {
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers);
    afterAll(() => server.close());
    afterEach(() => jest.clearAllMocks());

    it("should render properly", () => {
        const store = configureStore({ reducer: { posts: postsReducer, auth: authReducer } });
        const wrapper = mount(
            <Provider store={store}>
                <BrowserRouter>
                    <Postcreate mode="create/user" />
                </BrowserRouter>
            </Provider>,
        );
        const component = wrapper.find(Postcreate);
        expect(component.length).toBe(1);
    });
    it("should handle repo select", () => {
        const store = configureStore({ reducer: { posts: postsReducer, auth: authReducer } });
        const wrapper = mount(
            <Provider store={store}>
                <BrowserRouter>
                    <Postcreate mode="create/user" />
                </BrowserRouter>
            </Provider>,
        );
        const formSelect = wrapper.find("select");
        formSelect.simulate("change");
    });
    it("should set up correctly", () => {
        const store = configureStore({ reducer: { posts: postsReducer, auth: authReducer } });
        const wrapper = mount(
            <Provider store={store}>
                <BrowserRouter>
                    <Postcreate mode="create/user" />
                </BrowserRouter>
            </Provider>,
        );
        console.log(wrapper.html());
    });
});

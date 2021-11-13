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
import postsReducer from "./postsSlice";
import authReducer from "../auth/authSlice";
import reposReducer from "../repository/reposSlice";
import PostList from "./PostList";

const fact = new Factory();

const history = createBrowserHistory();
const historyMock = { ...history, push: jest.fn(), listen: jest.fn() };
describe("PostList", () => {
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers);
    afterAll(() => server.close());
    afterEach(() => jest.clearAllMocks());

    it("should render properly", () => {
        const store = configureStore({ reducer: { posts: postsReducer, auth: authReducer, repos: reposReducer } });
        const wrapper = mount(
            <Provider store={store}>
                <BrowserRouter>
                    <PostList />
                </BrowserRouter>
            </Provider>,
        );
        const component = wrapper.find(PostList);
        expect(component.length).toBe(1);
    });
});

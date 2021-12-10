import { configureStore } from "@reduxjs/toolkit";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import React, { Component } from "react";
import { Provider } from "react-redux";
import { Route, Router } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { Carousel } from "react-bootstrap";
import Factory from "../../mocks/dataGenerator";

import server from "../../mocks/server";
import Photo from "../photo/Photo";
import PCPhotoSelect from "./PCPhotoSelect";
import Post from "./Post";
import postsReducer from "./postsSlice";
import authReducer from "../auth/authSlice";
import PostDetail from "./PostDetail";

const fact = new Factory();

const history = createBrowserHistory();
const historyMock = { ...history, push: jest.fn(), listen: jest.fn() };
describe("PostDetail", () => {
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers);
    afterAll(() => server.close());
    afterEach(() => jest.clearAllMocks());

    it("should render properly", async () => {
        const store = configureStore({ reducer: { posts: postsReducer, auth: authReducer } });
        const wrapper = mount(
            <Provider store={store}>
                <BrowserRouter>
                    <PostDetail />
                </BrowserRouter>
            </Provider>,
        );
        const component = wrapper.find(PostDetail);
        expect(component.length).toBe(1);
    });
    // it("should handle carousel select", async () => {
    //     const store = configureStore({ reducer: { posts: postsReducer, auth: authReducer } });
    //     const wrapper = mount(
    //         <Provider store={store}>
    //             <BrowserRouter>
    //                 <PostDetail />
    //             </BrowserRouter>
    //         </Provider>,
    //     );
    //     const carousel = wrapper.find(Carousel);
    //     carousel.simulate("select");
    // });
});

import { configureStore } from "@reduxjs/toolkit";
import { mount, ReactWrapper, render } from "enzyme";
import { createBrowserHistory } from "history";
import React, { Component } from "react";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { Route, Router } from "react-router";
import { BrowserRouter } from "react-router-dom";
import Factory from "../../mocks/dataGenerator";
import { getRepoPostsHE } from "../../mocks/handlers";

import server from "../../mocks/server";
import Photo from "../photo/Photo";
import PCPhotoSelect from "./PCPhotoSelect";
import Post from "./Post";
import PostPreview from "./PostPreview";
import postsReducer from "./postsSlice";

const fact = new Factory();

const history = createBrowserHistory();
const historyMock = { ...history, push: jest.fn(), listen: jest.fn() };
describe("PostPreview", () => {
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers);
    afterAll(() => server.close());
    afterEach(() => jest.clearAllMocks());

    // it("should show nothing when loading", () => {
    //     const store = configureStore({ reducer: { posts: postsReducer } });
    //     const wrapper = mount(
    //         <Provider store={store}>
    //             <BrowserRouter>
    //                 <PostPreview />
    //             </BrowserRouter>
    //         </Provider>,
    //     );
    //     const component = wrapper.find(".loading");
    //     expect(component.length).toBe(1);
    // });
    it("should render properly", () => {
        const store = configureStore({ reducer: { posts: postsReducer } });
        const wrapper = mount(
            <Provider store={store}>
                <BrowserRouter>
                    <PostPreview />
                </BrowserRouter>
            </Provider>,
        );
        wrapper.update();
        const component = wrapper.find("PostPreview");
        expect(component.length).toBe(1);
    });
});

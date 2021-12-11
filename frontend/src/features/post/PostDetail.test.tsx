import { configureStore } from "@reduxjs/toolkit";
import { mount } from "enzyme";
import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import server from "../../mocks/server";
import postsReducer from "./postsSlice";
import authReducer from "../auth/authSlice";
import PostDetail from "./PostDetail";

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

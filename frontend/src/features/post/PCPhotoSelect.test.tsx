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
import postsReducer from "./postsSlice";

const fact = new Factory();

const history = createBrowserHistory();
const historyMock = { ...history, push: jest.fn(), listen: jest.fn() };
describe("PCPhotoSelect", () => {
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers);
    afterAll(() => server.close());
    afterEach(() => jest.clearAllMocks());

    const photos = [fact.photoGen(), fact.photoGen()];
    const setSelectedPhotos = jest.fn();
    const props = {
        onPhotoClick: jest.fn(),
        onCheck: jest.fn(),
    };

    it("should render properly", () => {
        const store = configureStore({ reducer: { posts: postsReducer } });
        const wrapper = mount(
            <Provider store={store}>
                <BrowserRouter><PCPhotoSelect photos={photos} setSelectedPhotos={setSelectedPhotos} /></BrowserRouter>
            </Provider>,
        );
        const component = wrapper.find("#post-create-photo-select");
        expect(component.length).toBe(1);
    });
    // it("should handle click", () => {
    //     const store = configureStore({ reducer: { posts: postsReducer } });
    //     const wrapper = mount(
    //         <Provider store={store}>
    //             <BrowserRouter>
    //                 <PCPhotoSelect
    //                     photos={photos}
    //                     setSelectedPhotos={setSelectedPhotos}
    //                 />

    //             </BrowserRouter>
    //         </Provider>,
    //     );
    //     const component = wrapper.find("#post-create-photo-select");
    //     const photo = component.find("Photo");
    //     photo.simulate("click");
    // });
    // it(" should handle photo check", () => {
    //     const onCheckMock = jest.fn();
    //     jest.spyOn(Photo, "default") {(props) => {}
    //     }
    //     const store = configureStore({ reducer: { posts: postsReducer } });
    //     const wrapper = mount(
    //         <Provider store={store}>
    //             <BrowserRouter>
    //                 <PCPhotoSelect
    //                     photos={photos}
    //                     setSelectedPhotos={setSelectedPhotos}
    //                 />

    //             </BrowserRouter>
    //         </Provider>,
    //     );
    //     const component = wrapper.find("#post-create-photo-select");
    //     const photo = component.find("Photo");
    //     photo.simulate("click");
    // });
});

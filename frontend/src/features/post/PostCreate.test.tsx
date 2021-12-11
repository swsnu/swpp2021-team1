import { configureStore } from "@reduxjs/toolkit";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import photosReducer from "../photo/photosSlice";
import Postcreate from "./PostCreate";
import postsReducer from "./postsSlice";
import authReducer from "../auth/authSlice";

describe("PostCreate", () => {
    describe("create/user", () => {
        it("should render", async () => {
            const store = configureStore({
                reducer: {
                    photos: photosReducer,
                    posts: postsReducer,
                    auth: authReducer,
                },
            });
            const wrapper = mount(
                <Provider store={store}>
                    <BrowserRouter>
                        <Postcreate mode="create/user" />
                    </BrowserRouter>
                </Provider>,
            );
            expect(wrapper.find(Postcreate).length).toBe(1);
        });
    });

    describe("create/repo", () => {
        it("should render", async () => {
            const store = configureStore({
                reducer: {
                    photos: photosReducer,
                    posts: postsReducer,
                    auth: authReducer,
                },
            });
            const wrapper = mount(
                <Provider store={store}>
                    <BrowserRouter>
                        <Postcreate mode="create/repo" />
                    </BrowserRouter>
                </Provider>,
            );
            expect(wrapper.find(Postcreate).length).toBe(1);
        });
    });

    describe("edit", () => {
        it("should render", async () => {
            const store = configureStore({
                reducer: {
                    photos: photosReducer,
                    posts: postsReducer,
                    auth: authReducer,
                },
            });
            const wrapper = mount(
                <Provider store={store}>
                    <BrowserRouter>
                        <Postcreate mode="edit" />
                    </BrowserRouter>
                </Provider>,
            );
            expect(wrapper.find(Postcreate).length).toBe(1);
        });
    });
});

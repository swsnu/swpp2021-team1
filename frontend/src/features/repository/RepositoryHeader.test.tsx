import { createBrowserHistory } from "history";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Route, Router } from "react-router-dom";
import React from "react";
import * as redux from "react-redux";
import { mount } from "enzyme";
import authReducer from "../auth/authSlice";
import reposReducer from "./reposSlice";
import postsReducer from "../post/postsSlice";
import photosReducer from "../photo/photosSlice";
import { repositoryFactory } from "../../common/Interfaces";
import RepositoryHeader from "./RepositoryHeader";

const history = createBrowserHistory();
const historyMock = { ...history, push: jest.fn(), listen: jest.fn() };

function makeStoredComponent() {
    const store = configureStore({
        reducer: {
            auth: authReducer,
            repos: reposReducer,
            posts: postsReducer,
            photos: photosReducer,
        },
    });

    return (
        <Provider store={store}>
            <Router history={historyMock}>
                <Route path="/" render={() => <RepositoryHeader />} />
            </Router>
        </Provider>
    );
}

describe("RepositoryHeader", () => {
    beforeEach(() => {
        const repo = repositoryFactory();

        jest.spyOn(redux, "useDispatch").mockImplementation((() =>
            () => ({
                then: (e: () => any) => e(),
            })) as typeof jest.fn);

        jest.spyOn(redux, "useSelector").mockImplementation((e: (e: any) => any) => e({
            repos: {
                currentRepo: repo,
                hasError: false,
                isLoading: false,
            },
        }));

        jest.spyOn(React, "useEffect").mockImplementation(jest.fn);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("Should not render if repository is null", () => {
        jest.spyOn(redux, "useSelector").mockImplementation((e: (e: any) => any) => e({
            repos: {
                currentRepo: null,
                hasError: false,
                isLoading: true,
            },
        }));
        const component = mount(makeStoredComponent());
        expect(component.find("h2").length).toBe(0);
    });

    it("Should render 404 Error if has error on fetch repo", () => {
        jest.spyOn(redux, "useSelector").mockImplementation((e: (e: any) => any) => e({
            repos: {
                currentRepo: null,
                hasError: true,
                isLoading: false,
            },
        }));
        const component = mount(makeStoredComponent());
        expect(component.find("div").text()).toContain("404");
    });

    it("Should render correctly", () => {
        const component = mount(makeStoredComponent());
        expect(component.find("h2").length).toBe(1);
        component.find("input").simulate("change", { target: { checked: true } });
        component.find("input").simulate("change", { target: { checked: false } });
    });
});

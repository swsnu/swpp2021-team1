import { createBrowserHistory } from "history";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import router, { Route, Router } from "react-router-dom";
import React from "react";
import * as redux from "react-redux";
import { mount } from "enzyme";
import authReducer from "../auth/authSlice";
import reposReducer from "./reposSlice";
import postsReducer from "../post/postsSlice";
import photosReducer from "../photo/photosSlice";
import * as actionCreator from "./reposSlice";
import { repositoryFactory, userFactory } from "../../common/Interfaces";
import RepositoryDetail from "./RepositoryDetail";
import PhotoPreview from "../photo/PhotoPreview";

//TODO

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
                <Route path="/" render={() => <RepositoryDetail />} />
            </Router>
        </Provider>
    );
}

describe("RepositoryDetail", () => {
    let mockSelector : any;
    beforeEach(() => {
        const repo = repositoryFactory();

        const spy = jest.spyOn(redux, "useDispatch").mockImplementation((() =>
            (e : any) => ({
                then: (e : () => any) => e(),
            })) as typeof jest.fn);

        mockSelector = jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            auth: {
                account: userFactory(),
                hasError: false,
                isLoading: false,
            },
            repos: {
                currentRepo: repo,
                hasError: false,
                isLoading: false,
            },
            photos: {
                isLoading: true,
                hasError: false,
                currentPhoto: null,
                photoList: [],
            },
        }));

        const effect = jest.spyOn(React, "useEffect").mockImplementation(jest.fn);
        const mockPhotoList = jest.mock("../photo/PhotoPreview", () => jest.fn((props) => (
            <div />)));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("Should not render if user is null", () => {
        mockSelector = jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            auth: {
                account: null,
                hasError: false,
                isLoading: true,
            },
            repos: {
                currentRepo: repositoryFactory(),
                hasError: false,
                isLoading: false,
            },
        }));
        const component = mount(makeStoredComponent());
        expect(component.find("h2").length).toBe(0);
    });

    it("Should not render if repository is null", () => {
        mockSelector = jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            auth: {
                account: userFactory(),
                hasError: false,
                isLoading: false,
            },
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
        mockSelector = jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            auth: {
                account: userFactory(),
                hasError: false,
                isLoading: false,
            },
            repos: {
                currentRepo: null,
                hasError: true,
                isLoading: false,
            },
        }));
        const component = mount(makeStoredComponent());
        expect(component.find("RepositoryDetail div").text()).toContain("404");
    });

    /* it("Should render correctly", () => {
        const component = mount(makeStoredComponent());
        component.find("RepositoryDetail Button").at(1).simulate("click");
        component.find("RepositoryDetail Button").at(0).simulate("click");
    });

    it("Should be able to click settings if has authorization", () => {
        const user = userFactory();
        mockSelector = jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            auth: {
                account: { ...user, friends: [] },
                hasError: false,
                isLoading: false,
            },
            repos: {
                currentRepo: { ...repositoryFactory(), collaborators: [user] },
                hasError: false,
                isLoading: false,
            },
            photos: {
                isLoading: true,
                hasError: false,
                currentPhoto: null,
                photoList: [],
            },
        }));
        const component = mount(makeStoredComponent());
        component.find("RepositoryDetail Button").at(2).simulate("click");
        expect(component.find("RepositorySettings").length).toBe(1);
    }); */
});

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
import { repositoryFactory, userFactory } from "../../common/Interfaces";
import RepositoryDetail from "./RepositoryDetail";
import * as Group from "./tab/Group";
import * as Mine from "./tab/Mine";
import * as RepositorySettings from "./tab/RepositorySettings";

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
    beforeEach(() => {
        const repo = repositoryFactory();

        jest.spyOn(redux, "useDispatch").mockImplementation((() =>
            () => ({
                then: (e : () => any) => e(),
            })) as typeof jest.fn);

        jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
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
        }));

        jest.spyOn(React, "useEffect").mockImplementation(jest.fn);
        jest.spyOn(Group, "default").mockImplementation(() => (<div id="group" />));
        jest.spyOn(Mine, "default").mockImplementation(() => (<div />));
        jest.spyOn(RepositorySettings, "default").mockImplementation(() => (<div />));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("Should not render if user is null", () => {
        jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
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
        jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
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

    /* it("Should render 404 Error if has error on fetch repo", () => {
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
    }); */

    it("Should render correctly", () => {
        const component = mount(makeStoredComponent());
        expect(component.find("#group").length).toBe(1);
    });

    it("Should be able to click tabs if has authorization", () => {
        const user = userFactory();
        jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
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
        }));
        const component = mount(makeStoredComponent());
        component.find("Tabs button").at(1).simulate("click");
        component.find("Tabs button").at(0).simulate("click");
        component.find("Tabs button").at(2).simulate("click");
    });
});

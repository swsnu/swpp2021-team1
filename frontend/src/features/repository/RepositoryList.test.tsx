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
import RepositorySettings from "./tab/RepositorySettings";
import RepositoryList from "./RepositoryList";
import { repositoryFactory, userFactory } from "../../common/Interfaces";
import * as actionCreator from "./reposSlice";

const history = createBrowserHistory();
const historyMock = { ...history, push: jest.fn(), listen: jest.fn() };

function makeStoredComponent() {
    const store = configureStore({
        reducer: {
            auth: authReducer,
            repos: reposReducer,
            posts: postsReducer,
        },
    });

    return (
        <Provider store={store}>
            <Router history={historyMock}>
                <Route path="/" render={() => <RepositoryList />} />
            </Router>
        </Provider>
    );
}

describe("RepositoryList", () => {
    let fetchMock : any;
    let loadMock : any;

    beforeEach(() => {
        const spy = jest.spyOn(redux, "useDispatch").mockImplementation((() =>
            (e : any) => ({
                then: (e : () => any) => e(),
            })) as typeof jest.fn);
        fetchMock = jest.spyOn(actionCreator, "fetchRepositories").mockImplementation(jest.fn);
        loadMock = jest.spyOn(actionCreator, "toBeLoaded").mockImplementation(() =>
            ({} as {type : string, payload : undefined}));
    });

    it("Should render correctly", () => {
        const mockSelector = jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            auth: {
                account: userFactory(),
                currentUser: userFactory(),
                hasError: false,
                isLoading: false,
            },
            repos: {
                repoList: [repositoryFactory()],
                hasError: false,
                isLoading: false,
            },
        }));
        const component = mount(makeStoredComponent());
        expect(component.find("Repository").length).toBe(1);
    });

    it("Should button if seeing my account", () => {
        const user = userFactory();
        const mockSelector = jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            auth: {
                account: user,
                currentUser: user,
                hasError: false,
                isLoading: false,
            },
            repos: {
                repoList: [repositoryFactory()],
                hasError: false,
                isLoading: false,
            },
        }));
        const component = mount(makeStoredComponent());
        expect(component.find("#repo-create-button").length).toBe(2);
        component.find("#repo-create-button").at(0).simulate("click");
        expect(loadMock).toHaveBeenCalledTimes(1);
    });
});

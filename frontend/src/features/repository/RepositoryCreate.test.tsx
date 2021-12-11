import { createMemoryHistory } from "history";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Route, Router } from "react-router-dom";
import React from "react";
import * as redux from "react-redux";
import { mount } from "enzyme";
import authReducer from "../auth/authSlice";
import reposReducer from "./reposSlice";
import postsReducer from "../post/postsSlice";
import * as actionCreator from "./reposSlice";
import * as actionCreator2 from "../route/routeSlice";
import { repositoryFactory, userFactory } from "../../common/Interfaces";
import RepositoryCreate from "./RepositoryCreate";
import * as SearchPlace from "../route/popup/SearchPlace";

const history = createMemoryHistory();
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
                <Route path="/" render={() => <RepositoryCreate />} />
            </Router>
        </Provider>
    );
}

describe("RepositoryCreate", () => {
    let createMock : any;
    let searchMock : any;

    beforeEach(() => {
        jest.spyOn(redux, "useDispatch").mockImplementation((() =>
            () => ({
                then: (e : () => any) => e(),
            })) as typeof jest.fn);
        createMock = jest.spyOn(actionCreator, "createRepository").mockImplementation(jest.fn);
        jest.spyOn(actionCreator, "editRegion").mockImplementation(jest.fn);
        searchMock = jest.spyOn(actionCreator2, "searchRegion").mockImplementation(jest.fn);
        jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            auth: {
                account: { ...userFactory(), friends: [] },
                hasError: false,
                isLoading: false,
            },
            repos: {
                currentRepo: null,
                hasError: false,
                isLoading: true,
            },
            route: {
                isQueryLoading: false,
                queryResult: [],
            },
        }));
        jest.spyOn(SearchPlace, "default").mockImplementation((props) => (
            <div>
                <button id="c" type="button" onClick={() => props.onConfirm({ place_id: "-1", formatted_address: "" })}>
                    mock
                </button>
                <button id="d" type="button" onClick={() => props.onSearch("")}>
                    mock
                </button>
            </div>
        ));
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
                currentRepo: null,
                hasError: false,
                isLoading: true,
            },
            route: {
                isQueryLoading: false,
                queryResult: [],
            },
        }));
        const component = mount(makeStoredComponent());
        expect(component.find("h2").length).toBe(0);
    });

    it("Should redirect if repository is created", () => {
        jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            auth: {
                account: null,
                hasError: false,
                isLoading: false,
            },
            repos: {
                currentRepo: repositoryFactory(),
                hasError: false,
                isLoading: false,
            },
            route: {
                isQueryLoading: false,
                queryResult: [],
            },
        }));
        const component = mount(makeStoredComponent());
        expect(component.find("Redirect").length).toBe(1);
    });

    it("Should not be able to make repo with invalid input", () => {
        const component = mount(makeStoredComponent());
        component.find("FormControl").at(0).simulate("change", { target: { name: "invalid", value: "" } });
        component.find("FormControl").at(0).simulate("change", { target: { name: "repo-name", value: "" } });
        component.find("FormControl").at(2).simulate("change", { target: { name: "start-date", value: "2000-55-22" } });
        component.find("FormControl").at(3).simulate("change", { target: { name: "end-date", value: "2021-99-30" } });
        component.find("#create-repo-button").at(0).simulate("click");
        expect(createMock).toHaveBeenCalledTimes(0);
    });

    it("Should be able to create repo", () => {
        const component = mount(makeStoredComponent());
        component.find("FormControl").at(0).simulate("change", { target: { name: "repo-name", value: "NewRepo" } });
        component.find("FormControl").at(2).simulate("change", { target: { name: "start-date", value: "2000-08-30" } });
        component.find("FormControl").at(3).simulate("change", { target: { name: "end-date", value: "2021-08-30" } });
        component.find("mockConstructor").find("button").at(0).simulate("click");
        const wrapper = component.find("FormCheck");
        wrapper.at(0).find("input").simulate("change", { target: { checked: false } });
        wrapper.at(1).find("input").simulate("change", { target: { checked: false } });
        wrapper.at(2).find("input").simulate("change", { target: { checked: false } });
        component.find("#create-repo-button").at(0).simulate("click");
        expect(createMock).toHaveBeenCalledTimes(1);
    });

    it("Should be able to pop-up add collaborator", () => {
        const component = mount(makeStoredComponent());
        component.find("#add-collaborator-button").at(0).simulate("click");
        expect(component.find("AddCollaborators ModalHeader").length).toBe(1);
    });

    it("Should be able to search place", () => {
        const component = mount(makeStoredComponent());
        component.find("#search-region-button").at(1).simulate("click");
        component.find("#d").simulate("click");
        expect(searchMock).toHaveBeenCalledTimes(1);
    });
});

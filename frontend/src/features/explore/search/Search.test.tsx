import { createBrowserHistory } from "history";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Route, Router } from "react-router-dom";
import React from "react";
import * as redux from "react-redux";
import { mount } from "enzyme";
import searchReducer from "./searchSlice";
import * as actionCreator from "./searchSlice";
import * as RepositorySearch from "./RepositorySearch";
import * as Friend from "../../profile/Friend";
import Search from "./Search";
import { repositorySearchFactory, userFactory } from "../../../common/Interfaces";

const history = createBrowserHistory();
const historyMock = { ...history, push: jest.fn(), listen: jest.fn() };

function makeStoredComponent() {
    const store = configureStore({
        reducer: {
            search: searchReducer,
        },
    });

    return (
        <Provider store={store}>
            <Router history={historyMock}>
                <Route path="/" render={() => <Search />} />
            </Router>
        </Provider>
    );
}

describe("Search", () => {
    let searchUserMock : any;
    let searchRepositoryMock : any;
    let searchRegionMock : any;

    beforeEach(() => {
        jest.spyOn(redux, "useDispatch").mockImplementation((() =>
            () => ({
                then: (e : () => any) => e(),
            })) as typeof jest.fn);
        searchUserMock = jest.spyOn(actionCreator, "searchUser").mockImplementation(jest.fn());
        searchRepositoryMock = jest.spyOn(actionCreator, "searchRepository").mockImplementation(jest.fn());
        searchRegionMock = jest.spyOn(actionCreator, "searchRegion").mockImplementation(jest.fn());
        jest.spyOn(RepositorySearch, "default").mockImplementation(() => <div />);
        jest.spyOn(Friend, "default").mockImplementation(() => <div />);
    });

    it("Should not render list if on loading", () => {
        jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            search: {
                isLoading: true,
                userResult: [userFactory()],
                repositoryResult: [],
                searchInfo: null,
            },
        }));
        const component = mount(makeStoredComponent());
        expect(component.find("ListGroup").length).toBe(0);
    });

    it("Should not render result message before search", () => {
        jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            search: {
                isLoading: false,
                userResult: [],
                repositoryResult: [],
                searchInfo: null,
            },
        }));
        const component = mount(makeStoredComponent());
        expect(component.find("h6").length).toBe(0);
    });

    it("Should be able to search", () => {
        jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            search: {
                isLoading: false,
                userResult: [userFactory()],
                repositoryResult: [repositorySearchFactory()],
                searchInfo: "test",
            },
        }));
        const component = mount(makeStoredComponent());
        component.find("DropdownItem").at(0).simulate("click");
        component.find("input").simulate("change", { target: { value: "test" } });
        component.find("#search-button").at(1).simulate("click");
        expect(searchUserMock).toHaveBeenCalledTimes(1);
        component.find("DropdownItem").at(1).simulate("click");
        component.find("#search-button").at(1).simulate("click");
        expect(searchRepositoryMock).toHaveBeenCalledTimes(1);
        component.find("DropdownItem").at(2).simulate("click");
        component.find("#search-button").at(1).simulate("click");
        expect(searchRegionMock).toHaveBeenCalledTimes(1);
    });
});

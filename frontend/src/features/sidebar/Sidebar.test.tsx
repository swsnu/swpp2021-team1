import { createBrowserHistory } from "history";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Route, Router } from "react-router-dom";
import React from "react";
import { mount } from "enzyme";
import * as react from "react";
import authReducer from "../auth/authSlice";
import { repositoryFactory, userFactory } from "../../common/Interfaces";
import Sidebar from "./Sidebar";
import * as actionCreators from "../auth/authSlice";
import { useAppSelector } from "../../app/hooks";
import * as redux from "../../app/hooks";

const history = createBrowserHistory();
const mockPush = jest.fn();
const historyMock = { ...history, push: mockPush, listen: jest.fn() };

function makeStoredComponent() {
    const store = configureStore({
        reducer: {
            auth: authReducer,
        },
    });

    return (
        <Provider store={store}>
            <Router history={historyMock}>
                <Route path="/" render={() => <Sidebar />} />
            </Router>
        </Provider>
    );
}

describe("RepositoryList", () => {
    let fetchMock : any;
    let outMock : any;
    let handleMock : any;

    beforeEach(() => {
        const fetchMock = jest.spyOn(actionCreators, "fetchSession").mockImplementation(() =>
            (jest.fn()));
        const outMock = jest.spyOn(actionCreators, "signOut").mockImplementation(() =>
            (jest.fn()));
        const handleMock = jest.spyOn(actionCreators, "handleError").mockImplementation(() =>
            ({ type: "" } as { payload: any; type: string; }));
        const mockSelector = jest.spyOn(redux, "useAppSelector").mockImplementation(() =>
            [false, false, userFactory()]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("Should render correctly", () => {
        const component = mount(makeStoredComponent());
        component.find("DropdownToggle").simulate("click");
        component.find("DropdownItem").at(0).simulate("click");
        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it("Should redirect if failed to fetch session", () => {
        const mockSelector = jest.spyOn(redux, "useAppSelector").mockImplementation(() =>
            [false, true, userFactory()]);
        const component = mount(makeStoredComponent());
        expect(component.find("Redirect").length).toBe(1);
    });

    it("Should be able to log out", () => {
        const mockEffect = jest.spyOn(react, "useEffect").mockImplementation(jest.fn());
        const spy = jest.spyOn(redux, "useAppDispatch").mockImplementation((() =>
            (e : any) => ({
                then: (e : () => any) => e(),
            })) as typeof jest.fn);
        const component = mount(makeStoredComponent());
        component.find("DropdownToggle").simulate("click");
        component.find("DropdownItem").at(1).simulate("click");
        expect(mockPush).toHaveBeenCalledTimes(1);
    });
});

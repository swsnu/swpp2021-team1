import { createBrowserHistory } from "history";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Route, Router } from "react-router-dom";
import React from "react";
import { mount } from "enzyme";
import * as redux from "react-redux";
import discussionsReducer from "./discussionsSlice";
import * as actionCreators from "./discussionsSlice";
import { commentFactory, discussionFactory, userFactory } from "../../common/Interfaces";
import DiscussionDetail from "./DiscussionDetail";
import * as Comment from "../comments/Comment";

const history = createBrowserHistory();
const mockPush = jest.fn();
const historyMock = { ...history, push: mockPush, listen: jest.fn() };

function makeStoredComponent() {
    const store = configureStore({
        reducer: {
            discussions: discussionsReducer,
        },
    });

    return (
        <Provider store={store}>
            <Router history={historyMock}>
                <Route path="/" render={() => <DiscussionDetail />} />
            </Router>
        </Provider>
    );
}

describe("DiscussionDetail", () => {
    let editDMock : any;
    let createCMock : any;
    let editCMock : any;
    let removeCMock : any;

    beforeEach(() => {
        jest.spyOn(actionCreators, "fetchDiscussion").mockImplementation(() =>
            (jest.fn()));
        editDMock = jest.spyOn(actionCreators, "editDiscussion").mockImplementation(() => (jest.fn()));
        jest.spyOn(actionCreators, "removeDiscussion").mockImplementation(() => (jest.fn()));
        createCMock = jest.spyOn(actionCreators, "createComment").mockImplementation(() => (jest.fn()));
        editCMock = jest.spyOn(actionCreators, "editComment").mockImplementation(() => (jest.fn()));
        removeCMock = jest.spyOn(actionCreators, "removeComment").mockImplementation(() => (jest.fn()));
        jest.spyOn(Comment, "default").mockImplementation((props) => (
            <div>
                <button type="button" onClick={() => props.edit("")}>edit</button>
                <button type="button" onClick={props.del}>delete</button>
            </div>
        ));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("Should not render until loading", () => {
        jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            auth: {
                account: { ...userFactory(), friends: [] },
                isLoading: true,
            },
            discussions: {
                currentDiscussion: null,
                hasError: false,
                isLoading: true,
            },
        }));
        const component = mount(makeStoredComponent());
        expect(component.find("div").length).toBe(0);
    });

    it("Should express 404 error if has error", () => {
        jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            auth: {
                account: { ...userFactory(), friends: [] },
                isLoading: false,
            },
            discussions: {
                currentDiscussion: null,
                hasError: true,
                isLoading: false,
            },
        }));
        const component = mount(makeStoredComponent());
        expect(component.find("div").text()).toContain("404");
    });

    it("Should be able edit/delete discussion if user is owner", () => {
        const user = userFactory();
        jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            auth: {
                account: { ...user, friends: [] },
                isLoading: false,
            },
            discussions: {
                currentDiscussion: { ...discussionFactory(), author: user },
                hasError: false,
                isLoading: false,
            },
        }));
        const component = mount(makeStoredComponent());
        component.find("button").at(0).simulate("click");
        component.find("input").at(0).simulate("change", { target: { value: "test" } });
        component.find("input").at(0).simulate("change", { target: { value: "test" } });
        component.find("button").at(0).simulate("click");
        expect(editDMock).toHaveBeenCalledTimes(1);
        /* component.find("button").at(1).simulate("click");
        expect(removeDMock).toHaveBeenCalledTimes(1); */
    });

    it("Should be able to add comment", () => {
        jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            auth: {
                account: userFactory(),
                isLoading: false,
            },
            discussions: {
                currentDiscussion: { ...discussionFactory(), author: userFactory() },
                hasError: false,
                isLoading: false,
            },
        }));
        const component = mount(makeStoredComponent());
        component.find("textarea").simulate("change", { target: { value: "test" } });
        component.find("button").at(0).simulate("click");
        expect(createCMock).toHaveBeenCalledTimes(1);
    });

    it("Should be able to edit/delete comment", () => {
        jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            auth: {
                account: userFactory(),
                isLoading: false,
            },
            discussions: {
                currentDiscussion: { ...discussionFactory(), author: userFactory(), comments: [commentFactory()] },
                hasError: false,
                isLoading: false,
            },
        }));
        const component = mount(makeStoredComponent());
        component.find("mockConstructor button").at(0).simulate("click");
        expect(editCMock).toHaveBeenCalledTimes(1);
        component.find("mockConstructor button").at(1).simulate("click");
        expect(removeCMock).toHaveBeenCalledTimes(1);
    });

    it("Should be able to go back to list page", () => {
        jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            auth: {
                account: userFactory(),
                isLoading: false,
            },
            discussions: {
                currentDiscussion: { ...discussionFactory(), author: userFactory(), comments: [commentFactory()] },
                hasError: false,
                isLoading: false,
            },
        }));
        const component = mount(makeStoredComponent());
        component.find("button").last().simulate("click");
        expect(mockPush).toHaveBeenCalledTimes(1);
    });
});

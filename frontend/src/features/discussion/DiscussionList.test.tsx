import { createBrowserHistory } from "history";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Route, Router } from "react-router-dom";
import React from "react";
import { mount } from "enzyme";
import * as redux from "react-redux";
import discussionsReducer from "./discussionsSlice";
import * as actionCreators from "./discussionsSlice";
import { discussionFactory, IDiscussion } from "../../common/Interfaces";
import DiscussionList from "./DiscussionList";

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
                <Route path="/" render={() => <DiscussionList />} />
            </Router>
        </Provider>
    );
}

describe("DiscussionList", () => {
    let list : IDiscussion[] = [];

    beforeEach(() => {
        jest.spyOn(actionCreators, "fetchDiscussions").mockImplementation(() =>
            (jest.fn()));
        jest.spyOn(actionCreators, "toBeLoaded").mockImplementation(() =>
            ({ type: "" } as { payload: any; type: string; }));
        list = [];
        for (let i = 0; i < 30; i++) {
            list.push(discussionFactory());
        }
        jest.spyOn(redux, "useSelector").mockImplementation(() => [false, false, list]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("Should not render until loading", () => {
        jest.spyOn(redux, "useSelector").mockImplementation(() =>
            [true, false, [discussionFactory()]]);
        const component = mount(makeStoredComponent());
        expect(component.find("div").length).toBe(0);
    });

    it("Should not render if has error", () => {
        jest.spyOn(redux, "useSelector").mockImplementation(() =>
            [false, true, [discussionFactory()]]);
        const component = mount(makeStoredComponent());
        expect(component.find("div").length).toBe(0);
    });

    it("Should be able to move create page", () => {
        const component = mount(makeStoredComponent());
        component.find("button").at(0).simulate("click");
        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it("Should be able to move page index", () => {
        const component = mount(makeStoredComponent());
        const wrapper = component.find(".justify-content-center button");
        wrapper.at(2).simulate("click");
        expect(component.find("ListGroup Discussion").length).toBe(10);
        wrapper.at(0).simulate("click");
        expect(component.find("ListGroup Discussion").length).toBe(20);
        wrapper.at(3).simulate("click");
        expect(component.find("ListGroup Discussion").length).toBe(10);
    });
});

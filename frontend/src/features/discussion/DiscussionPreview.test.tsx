import { createBrowserHistory } from "history";
import { AsyncThunkAction, configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Route, Router } from "react-router-dom";
import React from "react";
import { mount } from "enzyme";
import * as redux from "react-redux";
import discussionsReducer from "./discussionsSlice";
import DiscussionCreate from "./DiscussionCreate";
import * as actionCreators from "./discussionsSlice";
import { discussionFactory } from "../../common/Interfaces";
import DiscussionPreview from "./DiscussionPreview";

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
                <Route path="/" render={() => <DiscussionPreview />} />
            </Router>
        </Provider>
    );
}
// TODO : test 변경 필요
describe("DiscussionPreview", () => {
    beforeEach(() => {
        const mockfetch = jest.spyOn(actionCreators, "fetchDiscussions").mockImplementation((id : number) =>
            jest.fn());
        const mockLoad = jest.spyOn(actionCreators, "toBeLoaded").mockImplementation(() =>
            ({ type: "" } as { payload: any; type: string; }));
        const mockSelector = jest.spyOn(redux, "useSelector").mockImplementation(() =>
            [false, false, [discussionFactory()]]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("Should not render until loading", () => {
        const mockSelector = jest.spyOn(redux, "useSelector").mockImplementation(() =>
            [true, false, [discussionFactory()]]);
        const component = mount(makeStoredComponent());
        expect(component.find("div").length).toBe(0);
    });

    it("Should render correctly", () => {
        const component = mount(makeStoredComponent());
        component.find("button").at(0).simulate("click");
        component.find("button").at(1).simulate("click");
        expect(mockPush).toHaveBeenCalledTimes(2);
    });
});

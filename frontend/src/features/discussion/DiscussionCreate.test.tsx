import { createBrowserHistory } from "history";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Route, Router } from "react-router-dom";
import React from "react";
import { mount } from "enzyme";
import * as redux from "react-redux";
import discussionsReducer from "./discussionsSlice";
import DiscussionCreate from "./DiscussionCreate";
import * as actionCreators from "./discussionsSlice";
import { discussionFactory } from "../../common/Interfaces";

const history = createBrowserHistory();
const historyMock = { ...history, push: jest.fn(), listen: jest.fn() };

function makeStoredComponent() {
    const store = configureStore({
        reducer: {
            discussions: discussionsReducer,
        },
    });

    return (
        <Provider store={store}>
            <Router history={historyMock}>
                <Route path="/" render={() => <DiscussionCreate />} />
            </Router>
        </Provider>
    );
}

describe("DiscussionCreate", () => {
    it("Should not redirect if current discussion is loaded", () => {
        const mockSelector = jest.spyOn(redux, "useSelector").mockImplementation(() => [false, discussionFactory()]);
        const component = mount(makeStoredComponent());
        expect(component.find("Redirect").length).toBe(1);
    });

    it("Should render correctly", () => {
        const mockSelector = jest.spyOn(redux, "useSelector").mockImplementation(() => [true, null]);
        const mockDispatch = jest.spyOn(redux, "useDispatch").mockImplementation(jest.fn);
        const mockCreate = jest.spyOn(actionCreators, "createDiscussion").mockImplementation(jest.fn);
        const component = mount(makeStoredComponent());
        component.find("input").simulate("change", { target: { value: "TEST" } });
        component.find("textarea").simulate("change", { target: { value: "TEST" } });
        component.find("button").simulate("click");
        expect(mockCreate).toHaveBeenCalledTimes(1);
    });
});

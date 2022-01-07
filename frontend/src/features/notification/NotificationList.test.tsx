import { createBrowserHistory } from "history";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Route, Router } from "react-router-dom";
import React from "react";
import * as redux from "react-redux";
import { mount } from "enzyme";
import noticesReducer from "./noticesSlice";
import {
    NoticeAnswerType, NoticeType,
    notificationFactory,
} from "../../common/Interfaces";
import NotificationList from "./NotificationList";
import * as actionCreator from "./noticesSlice";
import * as Notification from "./Notification";
import * as NotificationResponse from "./NotificationResponse";

const history = createBrowserHistory();
const historyMock = { ...history, push: jest.fn(), listen: jest.fn() };

function makeStoredComponent() {
    const store = configureStore({
        reducer: {
            notices: noticesReducer,
        },
    });

    return (
        <Provider store={store}>
            <Router history={historyMock}>
                <Route path="/" render={() => <NotificationList />} />
            </Router>
        </Provider>
    );
}

describe("NotificationList", () => {
    let responseMock : any;

    beforeEach(() => {
        jest.spyOn(redux, "useDispatch").mockImplementation((() =>
            () => ({
                then: (e : () => any) => e(),
            })) as typeof jest.fn);
        jest.spyOn(actionCreator, "fetchNotifications").mockImplementation(jest.fn());
        // jest.spyOn(actionCreator, "fetchSession").mockImplementation(jest.fn());
        responseMock = jest.spyOn(actionCreator, "responseNotification").mockImplementation(jest.fn());
        jest.spyOn(Notification, "default").mockImplementation(() => <div />);
        jest.spyOn(NotificationResponse, "default").mockImplementation((props) =>
            (
                <div>
                    <button id="a" type="button" onClick={() => props.response(1, NoticeAnswerType.YES)} />
                </div>
            ));
    });

    it("Should render correctly", () => {
        const notification1 = { ...notificationFactory(), classification: NoticeType.INVITATION };
        const notification2 = { ...notificationFactory(), classification: NoticeType.FORK };
        jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            notices: {
                notifications: [notification1, notification2],
                hasError: false,
                isLoading: false,
            },
        }));
        const component = mount(makeStoredComponent());
        expect(component.find("ListGroup").length).toBe(1);
        component.find("#a").simulate("click");
        expect(responseMock).toHaveBeenCalledTimes(1);
    });

    it("Should not render until loading", () => {
        const notification1 = { ...notificationFactory(), classification: NoticeType.INVITATION };
        const notification2 = { ...notificationFactory(), classification: NoticeType.FORK };
        jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            notices: {
                notifications: [notification1, notification2],
                hasError: false,
                isLoading: true,
            },
        }));
        const component = mount(makeStoredComponent());
        expect(component.find("ListGroup").length).toBe(0);
    });
});

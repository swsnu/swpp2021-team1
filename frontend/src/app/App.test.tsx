import { mount } from "enzyme";
import { Provider } from "react-redux";
import React from "react";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import App from "./App";
import store from "./store";
import * as Sidebar from "../features/sidebar/Sidebar";

const history = createBrowserHistory();

describe("App", () => {
    beforeEach(() => {
        jest.spyOn(Sidebar, "default").mockImplementation(() => <div />);
    });

    it("Should render correctly", async () => {
        const component = mount(
            <Provider store={store}>
                <Router history={history}>
                    <App />
                </Router>
            </Provider>,
        );
        expect(component.find(".App").length).toBe(1);
    });

    /* it("Should render SignIn", async () => {
        const component = mount(
            <Provider store={store}>
                <Router history={history}>
                    <App />
                </Router>
            </Provider>,
        );
        history.push("/login");
        expect(component.find("SignIn").length).toBe(1);
    }); */

    /* it("Should render path components without error", async () => {
        const component = mount(
            <Provider store={store}>
                <Router history={history}>
                    <App />
                </Router>
            </Provider>,
        );
        history.push("/main/test");
        history.push("/repos/0/posts/create");
        history.push("/main/test/create");
    }); */
});

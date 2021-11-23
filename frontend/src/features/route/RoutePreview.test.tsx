import { createMemoryHistory } from "history";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Route, Router } from "react-router-dom";
import * as redux from "react-redux";
import React from "react";
import { mount } from "enzyme";
import reposReducer from "../repository/reposSlice";
import routeReducer from "./routeSlice";
import * as actionCreators from "./routeSlice";
import * as actionCreators2 from "../repository/reposSlice";
import * as Travel from "./popup/Travel";
import { repositoryFactory, routeFactory } from "../../common/Interfaces";
import RoutePreview from "./RoutePreview";

const history = createMemoryHistory();
const historyMock = { ...history, push: jest.fn(), listen: jest.fn() };

function makeStoredComponent() {
    const store = configureStore({
        reducer: {
            repos: reposReducer,
            route: routeReducer,
        },
    });

    return (
        <Provider store={store}>
            <Router history={historyMock}>
                <Route path="/" render={() => <RoutePreview />} />
            </Router>
        </Provider>
    );
}

describe("RoutePreview", () => {
    beforeEach(() => {
        jest.spyOn(redux, "useDispatch").mockImplementation((() =>
            () => ({
                then: (e: () => any) => e(),
            })) as typeof jest.fn);
        jest.spyOn(actionCreators, "fetchRoute").mockImplementation(jest.fn);
        jest.spyOn(actionCreators2, "toBeLoaded").mockImplementation(() =>
            ({ type: "", payload: undefined }));
        jest.spyOn(redux, "useSelector").mockImplementation((e: (e: any) => any) => e({
            repos: {
                currentRepo: repositoryFactory(),
            },
            route: {
                isLoading: false,
                hasError: false,
                currentRoute: routeFactory(),
            },
        }));
        jest.spyOn(Travel, "default").mockImplementation(() => <div />);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("Should not render if on loading", () => {
        jest.spyOn(redux, "useSelector").mockImplementation((e: (e: any) => any) => e({
            repos: {
                currentRepo: repositoryFactory(),
            },
            route: {
                isLoading: true,
                hasError: false,
                currentRoute: routeFactory(),
            },
        }));
        const component = mount(makeStoredComponent());
        expect(component.find("div").length).toBe(0);
    });
});

import { createMemoryHistory } from "history";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Route, Router } from "react-router-dom";
import React from "react";
import { mount } from "enzyme";
import { act } from "@testing-library/react";
import authReducer, { signIn } from "../auth/authSlice";
import reposReducer, { fetchRepository } from "../repository/reposSlice";
import routeReducer, { fetchRoute } from "./routeSlice";
import * as actionCreators from "./routeSlice";
import {
    repositoryFactory,
    routeFactory,
    userFactory,
} from "../../common/Interfaces";
import PlaceDetail from "./PlaceDetail";
import * as SearchPlace from "./popup/SearchPlace";
import * as Place from "./Place";
import * as FocusedPhoto from "../photo/popup/FocusedPhoto";
import * as Photo from "../photo/Photo";
import * as mockedAPI from "../../common/APIs";

const history = createMemoryHistory();
const historyMock = { ...history, push: jest.fn(), listen: jest.fn() };
const store = configureStore({
    reducer: {
        auth: authReducer,
        repos: reposReducer,
        route: routeReducer,
    },
});

function makeStoredComponent() {
    return (
        <Provider store={store}>
            <Router history={historyMock}>
                <Route path="/" render={() => <PlaceDetail />} />
            </Router>
        </Provider>
    );
}

describe("PlaceDetail", () => {
    const user = userFactory();
    let editMock : any;
    let addMock : any;
    let searchMock : any;

    beforeEach(() => {
        jest.spyOn(mockedAPI, "postSignIn").mockResolvedValue(user);
        jest.spyOn(mockedAPI, "getRepository").mockResolvedValue({ ...repositoryFactory(), collaborators: [user] });
        jest.spyOn(mockedAPI, "getRoute").mockResolvedValue(routeFactory());
        editMock = jest.spyOn(actionCreators, "editPlaces").mockImplementation(() =>
            ({ type: "", payload: undefined }) as any);
        jest.spyOn(actionCreators, "focusPhoto").mockImplementation(() =>
            ({ type: "", payload: undefined }));
        jest.spyOn(actionCreators, "editPhoto").mockImplementation(() =>
            ({ type: "", payload: undefined }) as any);
        addMock = jest.spyOn(actionCreators, "addPlace").mockImplementation(() =>
            ({ type: "", payload: undefined }) as any);
        searchMock = jest.spyOn(actionCreators, "searchPlace").mockImplementation(() =>
            ({ type: "", payload: undefined }) as any);
        jest.spyOn(actionCreators, "clearResult").mockImplementation(() =>
            ({ type: "", payload: undefined }));
        jest.spyOn(Place, "default").mockImplementation((props) => (
            <div>
                <button id="a" type="button" onClick={() => props.onPhotoClick(-1)}>
                    mock
                </button>
                <button id="b" type="button" onClick={() => props.onAdd(props.index)}>
                    mock
                </button>
                <button
                    id="c"
                    type="button"
                    onClick={() => props.onDelete(props.index, [props.place.photos[0].photo_id])}
                >
                    mock
                </button>
                <button id="d" type="button" onClick={() => props.onPlaceDelete(props.index)}>
                    mock
                </button>
            </div>
        ));
        jest.spyOn(SearchPlace, "default").mockImplementation((props) => (
            <div>
                <button id="e" type="button" onClick={() => props.onConfirm({ place_id: "-1", formatted_address: "" })}>
                    mock
                </button>
                <button id="f" type="button" onClick={() => props.onSearch("")}>
                    mock
                </button>
            </div>
        ));
        jest.spyOn(FocusedPhoto, "default").mockImplementation((props) =>
            <button id="g" type="button" onClick={() => props.onEdit("hello")}>mock</button>);
        jest.spyOn(Photo, "default").mockImplementation((props) => (
            <div>
                <button id="h" type="button" onClick={() => props.onClick(1)}>mock</button>
                <input id="i" type="checkbox" onChange={(event) => props.onCheck(event)} />
            </div>
        ));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("Should not render if on loading", async () => {
        await store.dispatch(signIn({ username: "", password: "" }));
        await store.dispatch(fetchRepository(-1));
        const component = mount(makeStoredComponent());
        expect(component.find("div").length).toBe(0);
    });

    it("Should be disable to add place if not has authorization", async () => {
        jest.spyOn(mockedAPI, "getRepository").mockResolvedValue({ ...repositoryFactory(), collaborators: [] });
        await store.dispatch(signIn({ username: "", password: "" }));
        await store.dispatch(fetchRepository(-1));
        await store.dispatch(fetchRoute(-1));
        let component: any = null;
        act(() => {
            component = mount(makeStoredComponent());
        });
        expect(component.find(".add-place-button").length).toBe(0);
    });

    it("Should be able to edit place", async () => {
        await store.dispatch(signIn({ username: "", password: "" }));
        await store.dispatch(fetchRepository(-1));
        await store.dispatch(fetchRoute(-1));
        jest.spyOn(actionCreators, "fetchRoute").mockImplementation(() =>
            ({ type: "", payload: undefined }) as any);
        const component = mount(makeStoredComponent());
        component.find("#edit-place-button").at(1).simulate("click");
        component.find("#i").simulate("change", { target: { value: true } });
        component.find("#b").simulate("click");
        component.find("#c").simulate("click");
        component.find("#d").simulate("click");
        component.find(".place-edit-confirm").at(1).simulate("click");
        expect(editMock).toHaveBeenCalledTimes(1);
    });

    it("Should be able to add place", async () => {
        jest.spyOn(actionCreators, "fetchRoute").mockImplementation(() =>
            ({ type: "", payload: undefined }) as any);
        const component = mount(makeStoredComponent());
        component.find("#f").simulate("click");
        expect(searchMock).toHaveBeenCalledTimes(1);
        component.find("#e").simulate("click");
        expect(addMock).toHaveBeenCalledTimes(1);
    });
});

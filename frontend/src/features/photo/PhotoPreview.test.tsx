import { createBrowserHistory } from "history";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Route, Router } from "react-router-dom";
import React from "react";
import * as redux from "react-redux";
import * as react from "react";
import { mount } from "enzyme";
import photosReducer from "./photosSlice";
import { photoFactory, repositoryFactory, userFactory } from "../../common/Interfaces";
import * as actionCreator from "./photosSlice";
import PhotoPreview from "./PhotoPreview";
import * as AddPhoto from "./popup/AddPhoto";
import * as FocusedPhoto from "./popup/FocusedPhoto";
import * as Photo from "./Photo";

const history = createBrowserHistory();
const historyMock = { ...history, push: jest.fn(), listen: jest.fn() };

function makeStoredComponent() {
    const store = configureStore({
        reducer: {
            photos: photosReducer,
        },
    });

    return (
        <Provider store={store}>
            <Router history={historyMock}>
                <Route path="/" render={() => <PhotoPreview />} />
            </Router>
        </Provider>
    );
}
// TODO : test 변경 필요
describe("PhotoPreview", () => {
    let fetchMock : any;
    let focusMock : any;
    let addMock : any;
    let editMock : any;
    let removeMock : any;

    beforeEach(() => {
        const spy = jest.spyOn(redux, "useDispatch").mockImplementation((() =>
            (e : any) => ({
                then: (e : () => any) => null,
            })) as typeof jest.fn);
        jest.spyOn(react, "useEffect").mockImplementation(jest.fn());
        fetchMock = jest.spyOn(actionCreator, "fetchPhotos").mockImplementation(jest.fn);
        focusMock = jest.spyOn(actionCreator, "focusPhoto").mockImplementation(() =>
            ({} as {type : string, payload : undefined}));
        addMock = jest.spyOn(actionCreator, "addPhotos").mockImplementation(jest.fn);
        editMock = jest.spyOn(actionCreator, "editPhotos").mockImplementation(jest.fn);
        removeMock = jest.spyOn(actionCreator, "removePhotos").mockImplementation(jest.fn);
        jest.spyOn(AddPhoto, "default").mockImplementation((props) =>
            <button id="a" type="button" onClick={() => props.commitPhotos(new FormData())}>mock</button>);
        jest.spyOn(FocusedPhoto, "default").mockImplementation((props) =>
            <button id="b" type="button" onClick={() => props.onEdit("hello")}>mock</button>);
        jest.spyOn(Photo, "default").mockImplementation((props) => (
            <div>
                <button id="c" type="button" onClick={() => props.onClick(1)}>mock</button>
                <input id="d" type="checkbox" onChange={(event) => props.onCheck(event)} />
            </div>
        ));
    });

    it("Should not render during loading", () => {
        const mockSelector = jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            photos: {
                photoList: [photoFactory(), photoFactory()],
                currentPhoto: photoFactory(),
                hasError: false,
                isLoading: true,
            },
        }));
        const component = mount(makeStoredComponent());
        expect(component.find("PhotoPreview div").length).toBe(0);
    });

    it("Should render correctly", () => {
        const mockSelector = jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            photos: {
                photoList: [photoFactory(), photoFactory()],
                currentPhoto: photoFactory(),
                hasError: false,
                isLoading: false,
            },
        }));
        const component = mount(makeStoredComponent());
        expect(component.find("PhotoPreview").length).toBe(1);
    });

    it("Should be able to delete photo", () => {
        const mockSelector = jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            photos: {
                photoList: [photoFactory(), photoFactory()],
                currentPhoto: photoFactory(),
                hasError: false,
                isLoading: false,
            },
        }));
        const component = mount(makeStoredComponent());
        component.find("#delete-photo-button").at(1).simulate("click");
        component.find("#cancel-photo-button").at(1).simulate("click");
        component.find("#delete-photo-button").at(1).simulate("click");
        component.find("#delete-photo-button").at(1).simulate("click");
        expect(removeMock).toHaveBeenCalledTimes(1);
    });

    it("Should be able to add photo", () => {
        const mockSelector = jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            photos: {
                photoList: [photoFactory(), photoFactory()],
                currentPhoto: photoFactory(),
                hasError: false,
                isLoading: false,
            },
        }));
        const component = mount(makeStoredComponent());
        component.find("#add-photo-button").at(1).simulate("click");
        component.find("mockConstructor").at(2).find("button").simulate("click");
        expect(addMock).toHaveBeenCalledTimes(1);
    });

    it("Should be able to edit photo", () => {
        const mockSelector = jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => e({
            photos: {
                photoList: [photoFactory(), photoFactory()],
                currentPhoto: photoFactory(),
                hasError: false,
                isLoading: false,
            },
        }));
        const component = mount(makeStoredComponent());
        component.find("mockConstructor").at(0).find("button").simulate("click");
        component.find("mockConstructor").at(3).find("button").simulate("click");
        expect(focusMock).toHaveBeenCalledTimes(1);
        expect(editMock).toHaveBeenCalledTimes(1);
    });
});

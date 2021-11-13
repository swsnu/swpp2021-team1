import { createBrowserHistory } from "history";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Route, Router } from "react-router-dom";
import React from "react";
import * as redux from "react-redux";
import { mount } from "enzyme";
import authReducer from "../../auth/authSlice";
import reposReducer from "../reposSlice";
import postsReducer from "../../post/postsSlice";
import SignUp from "../../auth/login/popup/SignUp";
import RepositorySettings from "./RepositorySettings";
import * as actionCreator from "../reposSlice";
import { repositoryFactory, userFactory } from "../../../common/Interfaces";

const history = createBrowserHistory();
const historyMock = { ...history, push: jest.fn(), listen: jest.fn() };

function makeStoredComponent() {
    const store = configureStore({
        reducer: {
            auth: authReducer,
            repos: reposReducer,
            posts: postsReducer,
        },
    });

    return (
        <Provider store={store}>
            <Router history={historyMock}>
                <Route path="/" render={() => <RepositorySettings />} />
            </Router>
        </Provider>
    );
}

describe("RepositorySettings", () => {
    let collabMock : any;
    let editMock : any;
    let removeMock : any;
    let secedeMock : any;
    let mockSelector : any;
    beforeEach(() => {
        const spy = jest.spyOn(redux, "useDispatch").mockImplementation((() =>
            (e : any) => ({
                then: (e : () => any) => e(),
            })) as typeof jest.fn);

        collabMock = jest.spyOn(actionCreator, "addCollaborators").mockImplementation(jest.fn);
        editMock = jest.spyOn(actionCreator, "editRepository").mockImplementation(jest.fn);
        removeMock = jest.spyOn(actionCreator, "removeRepository").mockImplementation(jest.fn);
        secedeMock = jest.spyOn(actionCreator, "leaveRepository").mockImplementation(jest.fn);
        mockSelector = jest.spyOn(redux, "useSelector").mockImplementation((e : (e : any) => any) => {
            e({ auth: { account: undefined }, repos: { currentRepo: undefined } });
            return [{ ...userFactory(), friends: [] }, { ...repositoryFactory(), collaborators: [userFactory()] }];
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("Should not be able to edit repo with invalid input", () => {
        const component = mount(makeStoredComponent());
        component.find("FormControl").at(0).simulate("change", { target: { name: "repo-name", value: "" } });
        component.find("FormControl").at(1).simulate("change", { target: { name: "start-date", value: "2000-55-22" } });
        component.find("FormControl").at(2).simulate("change", { target: { name: "end-date", value: "2021-99-30" } });
        component.find("#edit-repo-button").at(0).simulate("click");
        expect(editMock).toHaveBeenCalledTimes(0);
    });

    it("Should be able to edit repo", () => {
        const component = mount(makeStoredComponent());
        component.find("FormControl").at(0).simulate("change", { target: { name: "repo-name", value: "NewRepo" } });
        component.find("FormControl").at(1).simulate("change", { target: { name: "start-date", value: "2000-08-30" } });
        component.find("FormControl").at(2).simulate("change", { target: { name: "end-date", value: "2021-08-30" } });
        const wrapper = component.find("FormCheck");
        wrapper.at(0).find("input").simulate("change", { target: { checked: false } });
        wrapper.at(1).find("input").simulate("change", { target: { checked: false } });
        wrapper.at(2).find("input").simulate("change", { target: { checked: false } });
        component.find("#edit-repo-button").at(0).simulate("click");
        expect(editMock).toHaveBeenCalledTimes(1);
    });

    it("Should be able to leave repo", () => {
        const component = mount(makeStoredComponent());
        component.find("#leave-repo-button").at(0).simulate("click");
        expect(secedeMock).toHaveBeenCalledTimes(1);
    });

    it("Should be able to remove repo", () => {
        const user = { ...userFactory(), friends: [] };
        const mockSelector = jest.spyOn(redux, "useSelector").mockImplementation(() =>
            [user, { ...repositoryFactory(), owner: user.username }]);
        const component = mount(makeStoredComponent());
        component.find("#delete-repo-button").at(0).simulate("click");
        expect(removeMock).toHaveBeenCalledTimes(1);
    });

    it("Should be able to pop-up add collaborator", () => {
        const component = mount(makeStoredComponent());
        component.find("#add-collaborator-button").at(0).simulate("click");
        expect(component.find("AddCollaborators ModalHeader").length).toBe(1);
    });
});

import { AsyncThunkAction, configureStore } from "@reduxjs/toolkit";

import * as APIs from "../../common/APIs";
import Factory from "../../mocks/dataGenerator";

import authReducer, {
    signIn, signUp, signOut, addFriend, switchCurrentUser, fetchSession, updateProfile, toBeLoaded, handleError,
} from "./authSlice";

import {
    getSessionHE, getSignOutHE, handlerException, postSignInHE, postUserFriendHE, postUserHE,
} from "../../mocks/handlers";
import server from "../../mocks/server";
import SignUp from "./login/popup/SignUp";
import { IUser } from "../../common/Interfaces";

const fact = new Factory();

describe("authSlice", () => {
    let store = configureStore({
        reducer: {
            auth: authReducer,
        },
    });

    beforeEach(() => {
        store = configureStore({
            reducer: {
                auth: authReducer,
            },
        });
    });

    it("should fetch session correctly", async () => {
        await store.dispatch(fetchSession());
        expect(store.getState().auth.account).toBeTruthy();
    });
    it("should handle error on session fetch rejected", async () => {
        server.use(getSessionHE);
        const response = await store.dispatch(fetchSession());
        expect(response.meta.requestStatus).toEqual("rejected");
    });
    it("should log in correctly", async () => {
        await store.dispatch(signIn({ username: "", password: "" }));
        const { auth } = store.getState();
        expect(auth.account && auth.currentUser && auth.account.username === auth.currentUser.username);
    });
    it("should handle login error", async () => {
        server.use(postSignInHE);
        await store.dispatch(signIn({ username: "", password: "" }));
        expect(store.getState().auth.hasError).toBeTruthy();
    });
    it("should sign up correctly", async () => {
        await store.dispatch(signUp(fact.userGen()));
        expect(store.getState().auth.hasError).toBeFalsy();
    });
    it("should handle sign up error", async () => {
        server.use(postUserHE);
        await store.dispatch(signUp(fact.userGen()));
        expect(store.getState().auth.hasError).toBeTruthy();
    });
    it("should sign out correctly", async () => {
        const status = await (await store.dispatch(signOut())).meta.requestStatus;
        const { auth } = store.getState();
        expect(status).toBe("fulfilled");
        expect(auth.account).toBe(null);
        expect(auth.currentUser).toBe(null);
    });
    it("should handle sign out error", async () => {
        server.use(getSignOutHE);
        const status = await (await store.dispatch(signOut())).meta.requestStatus;
        expect(status).toBe("rejected");
    });
    it("should add friend correctly", async () => {
        const { auth } = store.getState();
        const response = await store.dispatch(
            addFriend("") as AsyncThunkAction<IUser, string, Record<string, unknown>>,
        );
        const status = await response.meta.requestStatus;
        expect(status).toBe("fulfilled");
    });
    // TODO
    // it("should handle add friend error", () => {
    //     server.use(postUserFriendHE);
    //     store.dispatch(addFriend(""));
    // });
    // TODO: handle switchCurrentUser
    // TODO: handle updateProfile
});

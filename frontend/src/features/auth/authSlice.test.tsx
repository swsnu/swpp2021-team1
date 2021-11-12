import { configureStore } from "@reduxjs/toolkit";

import Factory from "../../mocks/dataGenerator";

import authReducer, {
    signIn, signUp, signOut, addFriend, switchCurrentUser, fetchSession, updateProfile, toBeLoaded, handleError,
} from "./authSlice";
import server from "../../mocks/server";

import {
    getSessionHE, getSignOutHE, getUserHE, postSignInHE, postUserFriendHE, postUserHE, putUserHE,
} from "../../mocks/handlers";

const fact = new Factory();

describe("authSlice", () => {
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers);
    afterAll(() => server.close());

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
        const status = (await store.dispatch(signOut())).meta.requestStatus;
        const { auth } = store.getState();
        expect(status).toBe("fulfilled");
        expect(auth.account).toBe(null);
        expect(auth.currentUser).toBe(null);
    });
    it("should handle sign out error", async () => {
        server.use(getSignOutHE);
        const status = (await store.dispatch(signOut())).meta.requestStatus;
        expect(status).toBe("rejected");
    });
    it("should add friend correctly", async () => {
        const response = await store.dispatch(
            addFriend("abc"),
        );
        const status = response.meta.requestStatus;
        expect(status).toBe("fulfilled");
    });

    // TODO (178-179)
    it("should add friend correctly when currentUser is the new friend", async () => {
        await store.dispatch(switchCurrentUser("abc"));
        const currentUsername = store.getState().auth.currentUser?.username as string;
        const response = await store.dispatch(
            addFriend(currentUsername),
        );
        const status = response.meta.requestStatus;
        expect(status).toBe("fulfilled");
    });
    it("should handle add friend error", async () => {
        server.use(postUserFriendHE);
        const response = await store.dispatch(addFriend("abc"));
        const status = response.meta.requestStatus;
        expect(status).toBe("rejected");
    });

    it("should switch current user properly", async () => {
        const response = await store.dispatch(switchCurrentUser("abc"));
        const status = await response.meta.requestStatus;
        expect(status).toBe("fulfilled");
    });
    it("should handle switch current user error", async () => {
        server.use(getUserHE);
        const response = await store.dispatch(switchCurrentUser("abc"));
        const status = response.meta.requestStatus;
        expect(status).toBe("rejected");
    });

    // TODO (187-192)
    it("should handle update profile", async () => {
        const response = await store.dispatch(updateProfile({
            account: fact.userGen(),
            form: {
                email: "a", real_name: "a", bio: "a", password: "a",
            },
        }));
        const status = response.meta.requestStatus;
        expect(status).toBe("fulfilled");
    });
    it("should handle update profile error", async () => {
        server.use(putUserHE);
        const response = await store.dispatch(updateProfile({
            account: fact.userGen(),
            form: {
                email: "a", real_name: "a", bio: "a", password: "a",
            },
        }));
        const status = response.meta.requestStatus;
        expect(status).toBe("rejected");
    });

    it("should handle toBeLoaded", () => {
        store.dispatch(toBeLoaded(""));
        expect(store.getState().auth.isLoading).toBeTruthy();
    });
    it("should handle handleError", () => {
        store.dispatch(handleError(""));
        expect(store.getState().auth.hasError).toBeFalsy();
    });
});

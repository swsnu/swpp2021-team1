import { configureStore } from "@reduxjs/toolkit";

import Factory from "../../mocks/dataGenerator";
import {
    getSessionHE, getSignOutHE, getUserHE, postSignInHE, postUserFriendHE, postUserHE,
} from "../../mocks/handlers";
import server from "../../mocks/server";
import authReducer, {
    addFriend,
    fetchSession,
    handleError,
    signIn,
    signOut,
    signUp,
    switchCurrentUser,
    toBeLoaded,
} from "./authSlice";

const fact = new Factory();

describe("authSlice", () => {
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers);
    afterEach(() => jest.clearAllMocks());
    afterAll(() => server.close());

    let store = configureStore({
        reducer: {
            auth: authReducer,
        },
    });

    beforeEach(() => {
        store = configureStore({
            reducer: { auth: authReducer },
        });
    });

    it("should fetch session correctly", async () => {
        await store.dispatch(fetchSession());
        expect(store.getState().auth.account).toBeTruthy();
        await store.dispatch(fetchSession());
    });
    it("should handle error on session fetch rejected", async () => {
        server.use(getSessionHE);
        const response = await store.dispatch(fetchSession());
        expect(response.meta.requestStatus).toEqual("rejected");
    });
    it("should log in correctly", async () => {
        await store.dispatch(signIn({ username: "", password: "" }));
        const { auth } = store.getState();
        expect(auth.account && auth.currentUser && auth.account.username === auth.currentUser.username).toBeTruthy();
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
        await store.dispatch(fetchSession());
        const response = await store.dispatch(
            addFriend({ username: "username", fusername: "fusername" }),
        );
        const status = response.meta.requestStatus;
        expect(status).toBe("fulfilled");
    });

    it("should add friend correctly when currentUser is the new friend", async () => {
        await store.dispatch(switchCurrentUser("username"));
        const currentUsername = store.getState().auth.currentUser?.username as string;
        const response = await store.dispatch(
            addFriend({ username: currentUsername, fusername: "fusername" }),
        );
        const status = response.meta.requestStatus;
        expect(status).toBe("fulfilled");
    });
    it("should handle add friend error", async () => {
        server.use(postUserFriendHE);
        const response = await store.dispatch(
            addFriend({ username: "username", fusername: "fusername" }),
        );
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
    it("should switch current user to myself", async () => {
        await store.dispatch(fetchSession());
        const user1 = store.getState().auth.account;
        await store.dispatch(switchCurrentUser("abc"));
        await store.dispatch(switchCurrentUser(user1?.username as string));
    });
    // it("should handle updateProfile properly", async () => {
    //     store = configureStore({
    //         reducer: {
    //             auth: authReducer,
    //             repos: reposReducer,
    //             posts: postsReducer,
    //             photos: photosReducer,
    //             discussions: discussionsReducer,
    //             route: routeReducer,
    //             labels: labelsReducer,
    //         },
    //     });
    //     await store.dispatch(fetchSession());
    //     await store.dispatch(updateProfile({
    //         email: "dd@dd.com",
    //         real_name: "abc",
    //         bio: "d",
    //         password: "d",
    //     }));
    // });
    // it("should handle AddFriend", async () => {
    //     await store.dispatch(fetchSession());
    //     console.log(store.getState().auth);
    //     await store.dispatch(addFriend({ username: "abc", fusername: "def" }));
    // });

    it("should handle toBeLoaded", () => {
        store.dispatch(toBeLoaded(""));
        expect(store.getState().auth.isLoading).toBeTruthy();
    });
    it("should handle handleError", () => {
        store.dispatch(handleError(""));
        expect(store.getState().auth.hasError).toBeFalsy();
    });
});

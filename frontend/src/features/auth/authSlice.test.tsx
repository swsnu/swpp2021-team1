import { configureStore, unwrapResult } from "@reduxjs/toolkit";
import * as APIs from "../../common/APIs";
import { userFactory, UserProfileType, Visibility } from "../../common/Interfaces";
import authReducer, {
    addFriend,
    authInitialState,
    fetchSession,
    handleError,
    signIn,
    signOut,
    signUp,
    switchCurrentUser,
    toBeLoaded,
    unfriend,
    updateProfile,
    updateProfilePicture,
    removeProfilePicture,
} from "./authSlice";

jest.mock("../../common/APIs");
const mockedAPIs = APIs as jest.Mocked<typeof APIs>;

describe("authSlice", () => {
    afterEach(() => jest.clearAllMocks());
    describe("thunks", () => {
        it("should handle signIn", async () => {
            const user1 = userFactory();
            mockedAPIs.postSignIn.mockResolvedValue(user1);
            const store = configureStore({
                reducer: {
                    auth: authReducer,
                },
            });
            const resultAction = await store.dispatch(signIn({ username: "abc", password: "abc" }));
            expect(unwrapResult(resultAction)).toEqual(user1);
        });
        it("should handle signUp", async () => {
            const user1 = userFactory();
            mockedAPIs.postUsers.mockResolvedValue(user1);
            const store = configureStore({
                reducer: {
                    auth: authReducer,
                },
            });
            const resultAction = await store.dispatch(signUp(user1));
            expect(unwrapResult(resultAction)).toEqual(user1);
        });
        it("should handle signOut", async () => {
            mockedAPIs.getSignOut.mockResolvedValue();
            const store = configureStore({
                reducer: {
                    auth: authReducer,
                },
            });
            const resultAction = await store.dispatch(signOut());
            expect(resultAction.meta.requestStatus).toEqual("fulfilled");
        });
        it("should handle addFriend", async () => {
            const user = userFactory();
            mockedAPIs.postFriends.mockResolvedValue([user]);
            const store = configureStore({
                reducer: {
                    auth: authReducer,
                },
            });
            const resultAction = await store.dispatch(addFriend({ username: "abc", fusername: "def" }));
            expect(resultAction.meta.requestStatus).toEqual("fulfilled");
        });
        it("should handle unfriend", async () => {
            mockedAPIs.deleteFriends.mockResolvedValue();
            const store = configureStore({
                reducer: {
                    auth: authReducer,
                },
            });
            const resultAction = await store.dispatch(unfriend({ username: "abc", fusername: "def" }));
            expect(resultAction.meta.requestStatus).toEqual("fulfilled");
        });

        it("should handle switchCurrentUser", async () => {
            const user1 = userFactory();
            mockedAPIs.getUser.mockResolvedValue(user1);
            const store = configureStore({
                reducer: {
                    auth: authReducer,
                },
            });
            const resultAction = await store.dispatch(switchCurrentUser("abc"));
            expect(unwrapResult(resultAction)).toEqual(user1);
        });
        it("should handle updateProfile", async () => {
            const user = userFactory();
            const form = {
                email: "a", real_name: "b", bio: "c", password: "d", visibility: Visibility.ALL,
            };
            const formData = new FormData();
            mockedAPIs.getSession.mockResolvedValue(user);
            const store = configureStore({
                reducer: {
                    auth: authReducer,
                },
            });
            store.dispatch(fetchSession());
            mockedAPIs.putUser.mockResolvedValue({ ...user, real_name: "abc" });
            store.dispatch(updateProfile(form));
            mockedAPIs.postProfilePicture.mockResolvedValue({ profile_picture: "abc" });
            store.dispatch(updateProfilePicture(formData));
            store.dispatch(removeProfilePicture());
        });
    });

    describe("reducers", () => {
        it("should handle toBeLoaded", () => {
            const action = { type: toBeLoaded.type };
            const state = authReducer({
                ...authInitialState,
                isLoading: false,
            }, action);
            expect(state.isLoading).toBeTruthy();
        });

        it("should handle handleError", () => {
            const action = { type: handleError.type };
            const state = authReducer({
                ...authInitialState,
                hasError: true,
            }, action);
            expect(state.hasError).toBeFalsy();
        });

        it("should handle signIn.pending", () => {
            const action = { type: signIn.pending.type };
            const state = authReducer(
                authInitialState, action,
            );
            expect(state.isLoading).toBeTruthy();
            expect(state.hasError).toBeFalsy();
        });

        it("should handle signIn.fulfilled", () => {
            const user = userFactory();
            const action = { type: signIn.fulfilled.type, payload: user };
            const state = authReducer(
                authInitialState, action,
            );
            expect(state.account).toEqual(user);
            expect(state.currentUser).toEqual(user);
        });

        it("should handle signIn.rejected", () => {
            const action = { type: signIn.rejected.type };
            const state = authReducer(
                authInitialState, action,
            );
            expect(state.hasError).toEqual(true);
        });
        it("should handle fetchSession.pending", () => {
            const action = { type: fetchSession.pending.type };
            const user = userFactory();
            let state = authReducer({
                isLoading: false,
                hasError: false,
                account: user,
                currentUser: null,
            }, action);
            expect(state.isLoading).toBeFalsy();
            expect(state.hasError).toBeFalsy();
            state = authReducer(authInitialState, action);
            expect(state.isLoading).toBeTruthy();
            expect(state.hasError).toBeFalsy();
        });
        it("should handle fetchSession.fulfilled", () => {
            const user = userFactory();
            const action = { type: fetchSession.fulfilled.type, payload: user };
            const state = authReducer(authInitialState, action);
            expect(state.account).toEqual(user);
        });

        it("should handle fetchSession.rejected", () => {
            const action = { type: fetchSession.rejected.type };
            const state = authReducer(authInitialState, action);
            expect(state.hasError).toBeTruthy();
        });

        it("should handle signUp.pending", () => {
            const action = { type: signUp.pending.type };
            const state = authReducer(authInitialState, action);
            expect(state.isLoading).toBeTruthy();
        });

        it("should handle signUp.fulfilled", () => {
            const action = { type: signUp.fulfilled.type };
            const state = authReducer({
                isLoading: true,
                hasError: false,
                account: null,
                currentUser: null,
            }, action);
            expect(state.isLoading).toBeFalsy();
            expect(state.hasError).toBeFalsy();
        });
        it("should handle signUp.rejected", () => {
            const action = { type: signUp.rejected.type };
            const state = authReducer({
                ...authInitialState,
                isLoading: true,
            }, action);
            expect(state.isLoading).toBeFalsy();
            expect(state.hasError).toBeTruthy();
        });

        it("should handle signOut.fulfilled", () => {
            const user = userFactory();
            const action = { type: signOut.fulfilled.type };
            const state = authReducer({
                isLoading: false,
                hasError: false,
                account: user,
                currentUser: null,
            }, action);
            expect(state.account).toBeNull();
        });

        it("should handle switchCurrentUser.pending", () => {
            const user1 = userFactory();
            const action = { type: switchCurrentUser.pending.type };
            const state = authReducer({
                isLoading: false,
                hasError: false,
                account: user1,
                currentUser: user1,
            }, action);
            expect(state.isLoading).toBeTruthy();
        });
        it("should handle switchCurrentUser.fulfilled", () => {
            const user1 = userFactory();
            const user2 = userFactory();
            const action = { type: switchCurrentUser.fulfilled.type, payload: user2 };
            const state = authReducer({
                isLoading: false,
                hasError: false,
                account: user1,
                currentUser: user1,
            }, action);
            expect(state.currentUser).toEqual(user2);
        });

        it("should handle switchCurrentUser.rejected", () => {
            const user1 = userFactory();
            const user2 = userFactory();
            const action = { type: switchCurrentUser.rejected.type, payload: user2 };
            const state = authReducer({
                isLoading: false,
                hasError: false,
                account: user1,
                currentUser: user1,
            }, action);
            expect(state.currentUser).toBeNull();
        });

        it("should handle addFriend.fulfilled", () => {
            const me = userFactory();
            const friend = userFactory();
            const action = { type: addFriend.fulfilled.type, payload: [me] };
            authReducer(authInitialState, action);
            const state = authReducer({
                isLoading: false,
                hasError: false,
                account: me,
                currentUser: friend,
            }, action);
            expect(state.currentUser?.friend_status).toEqual(UserProfileType.REQUEST_SENDED);
        });
        it("should handle unfriend.fulfilled", () => {
            const action = { type: unfriend.fulfilled.type };
            const me = userFactory();
            const friend = userFactory();
            const user3 = userFactory();
            authReducer(authInitialState, action);
            authReducer({
                isLoading: false,
                hasError: false,
                account: me,
                currentUser: friend,
            }, action);
            const state = authReducer({
                isLoading: false,
                hasError: false,
                account: me,
                currentUser: { ...friend, friends: [me] },
            }, action);
            expect(state.currentUser?.friends?.length).toBe(0);
            authReducer({
                isLoading: false,
                hasError: false,
                account: me,
                currentUser: { ...friend, friends: [user3] },
            }, action);
        });

        it("should handle updateProfile.fulfilled", () => {
            const user1 = userFactory();
            const user2 = userFactory();
            const action = {
                type: updateProfile.fulfilled.type,
                payload: {
                    email: "",
                    real_name: "new_name",
                    bio: "",
                    password: "",
                    visibility: Visibility.ALL,
                },
            };
            authReducer({
                isLoading: false,
                hasError: false,
                account: null,
                currentUser: null,
            }, action);
            let state = authReducer({
                isLoading: false,
                hasError: false,
                account: user1,
                currentUser: null,
            }, action);
            expect(state.account?.real_name).toBe("new_name");
            state = authReducer({
                isLoading: false,
                hasError: false,
                account: user1,
                currentUser: user1,
            }, action);
            expect(state.account?.real_name).toBe("new_name");
            expect(state.currentUser?.real_name).toBe("new_name");
            state = authReducer({
                isLoading: false,
                hasError: false,
                account: user1,
                currentUser: user2,
            }, action);
            expect(state.account?.real_name).toBe("new_name");
        });

        it("should handle updateProfilePicture.fulfilled", () => {
            const action = { type: updateProfilePicture.fulfilled.type, payload: "image" };
            const user1 = userFactory();
            const user2 = userFactory();
            authReducer(authInitialState, action);
            let state = authReducer({
                isLoading: false,
                hasError: false,
                account: user1,
                currentUser: null,
            }, action);
            expect(state.account?.profile_picture).toBe("image");
            state = authReducer({
                isLoading: false,
                hasError: false,
                account: user1,
                currentUser: user1,
            }, action);
            expect(state.account?.profile_picture).toBe("image");
            expect(state.currentUser?.profile_picture).toBe("image");
            state = authReducer({
                isLoading: false,
                hasError: false,
                account: user1,
                currentUser: user2,
            }, action);
            expect(state.account?.profile_picture).toBe("image");
        });
        it("should handle removeProfilePicture.fulfilled", () => {
            const action = { type: removeProfilePicture.fulfilled.type };
            const user1 = userFactory();
            authReducer(authInitialState, action);
            const state = authReducer({
                isLoading: false,
                hasError: false,
                account: { ...user1, profile_picture: "abc" },
                currentUser: null,
            }, action);
            expect(state.account?.profile_picture).toBeUndefined();
        });
    });
});

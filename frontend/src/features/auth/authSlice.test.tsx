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
    // describe('thunks', () => {

    // })

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
            const user2 = userFactory();
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
            let state = authReducer(authInitialState, action);
            state = authReducer({
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
            let state = authReducer(authInitialState, action);
            state = authReducer({
                isLoading: false,
                hasError: false,
                account: me,
                currentUser: friend,
            }, action);
            state = authReducer({
                isLoading: false,
                hasError: false,
                account: me,
                currentUser: { ...friend, friends: [me] },
            }, action);
            expect(state.currentUser?.friends?.length).toBe(0);
            state = authReducer({
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
            let state = authReducer({
                isLoading: false,
                hasError: false,
                account: null,
                currentUser: null,
            }, action);
            state = authReducer({
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
            let state = authReducer(authInitialState, action);
            state = authReducer({
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
            let state = authReducer(authInitialState, action);
            state = authReducer({
                isLoading: false,
                hasError: false,
                account: { ...user1, profile_picture: "abc" },
                currentUser: null,
            }, action);
            expect(state.account?.profile_picture).toBeUndefined();
        });
    });
});

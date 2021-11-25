import { configureStore } from "@reduxjs/toolkit";
import * as APIs from "../../common/APIs";
import {
    commentFactory,
    discussionFactory, IComment,
    IDiscussion,
} from "../../common/Interfaces";
import discussionsReducer, {
    fetchDiscussions, fetchDiscussion,
    createDiscussion, editDiscussion, removeDiscussion,
    createComment, editComment, removeComment,
    handleError, toBeLoaded,
} from "./discussionsSlice";

jest.mock("../../common/APIs");
const mockedAPIs = APIs as jest.Mocked<typeof APIs>;

describe("discussionsSlice", () => {
    let store = configureStore({
        reducer: {
            discussions: discussionsReducer,
        },
    });

    beforeEach(() => {
        store = configureStore({
            reducer: {
                discussions: discussionsReducer,
            },
        });
    });

    it("Should fetch discussions correctly", () => {
        const discussion : IDiscussion = discussionFactory();
        mockedAPIs.getDiscussions.mockResolvedValue([discussion]);
        store.dispatch(fetchDiscussions(1)).then(() => {
            expect(store.getState().discussions.discussionList.length).toBe(1);
        });
        mockedAPIs.getDiscussions.mockRejectedValue(undefined);
        store.dispatch(fetchDiscussions(1)).then(() => {
            expect(store.getState().discussions.hasError).toEqual(true);
        });
    });

    it("Should fetch discussion correctly", () => {
        const discussion : IDiscussion = discussionFactory();
        mockedAPIs.getDiscussion.mockResolvedValue(discussion);
        store.dispatch(fetchDiscussion(1)).then(() => {
            expect(store.getState().discussions.currentDiscussion).toEqual(discussion);
        });
        mockedAPIs.getDiscussion.mockRejectedValue(undefined);
        store.dispatch(fetchDiscussion(1)).then(() => {
            expect(store.getState().discussions.hasError).toEqual(true);
        });
    });

    it("Should create discussion correctly", () => {
        const discussion : IDiscussion = discussionFactory();
        mockedAPIs.postDiscussions.mockResolvedValue(discussion);
        store.dispatch(createDiscussion({ repo_id: -1, discussion })).then(() => {
            expect(store.getState().discussions.currentDiscussion).toEqual(discussion);
        });
        mockedAPIs.postDiscussions.mockRejectedValue(undefined);
        store.dispatch(createDiscussion({ repo_id: -1, discussion })).then(() => {
            expect(store.getState().discussions.hasError).toEqual(true);
        });
    });

    it("Should edit discussion correctly", () => {
        const discussion : IDiscussion = discussionFactory();
        mockedAPIs.putDiscussion.mockResolvedValue(discussion);
        store.dispatch(editDiscussion(discussion)).then(() => {
            expect(store.getState().discussions.currentDiscussion).toEqual(discussion);
        });
        mockedAPIs.putDiscussion.mockRejectedValue(undefined);
        store.dispatch(editDiscussion(discussion)).then(() => {
            expect(store.getState().discussions.hasError).toEqual(true);
        });
    });

    it("Should remove discussion correctly + toBeLoaded + handleError", () => {
        const discussion : IDiscussion = discussionFactory();
        mockedAPIs.deleteDiscussion.mockResolvedValue();
        store.dispatch(removeDiscussion(1)).then(() => {
            expect(store.getState().discussions.isLoading).toEqual(false);
        });
        mockedAPIs.deleteDiscussion.mockRejectedValue(undefined);
        store.dispatch(removeDiscussion(1)).then(() => {
            expect(store.getState().discussions.hasError).toEqual(true);
        });
        store.dispatch(toBeLoaded(null));
        expect(store.getState().discussions.isLoading).toEqual(true);
        store.dispatch(handleError(null));
        expect(store.getState().discussions.hasError).toEqual(false);
    });

    it("Should create comment correctly", () => {
        const discussion : IDiscussion = discussionFactory();
        const comment : IComment = commentFactory();
        mockedAPIs.postDiscussionComment.mockResolvedValue([comment]);
        mockedAPIs.getDiscussion.mockResolvedValue(discussion);
        store.dispatch(createComment({ discussion_id: -1, text: comment.text }))
            .then(() => {
                expect(store.getState().discussions.isLoading).toEqual(true);
                store.dispatch(fetchDiscussion(1)).then(() => {
                    store.dispatch(createComment({ discussion_id: -1, text: comment.text })).then(() => {
                        expect(store.getState().discussions.currentDiscussion?.comments).toEqual([comment]);
                        mockedAPIs.postDiscussionComment.mockRejectedValue(undefined);
                        store.dispatch(createComment({ discussion_id: -1, text: comment.text })).then(() => {
                            expect(store.getState().discussions.hasError).toEqual(true);
                        });
                    });
                });
            });
    });

    it("Should edit comment correctly", () => {
        const discussion : IDiscussion = discussionFactory();
        const comment : IComment = commentFactory();
        mockedAPIs.putDiscussionComment.mockResolvedValue([comment]);
        mockedAPIs.getDiscussion.mockResolvedValue(discussion);
        store.dispatch(editComment({ discussion_id: -1, comment_id: comment.comment_id, text: comment.text }))
            .then(() => {
                expect(store.getState().discussions.isLoading).toEqual(true);
                store.dispatch(fetchDiscussion(1)).then(() => {
                    store.dispatch(editComment({
                        discussion_id: -1,
                        comment_id: comment.comment_id,
                        text: comment.text,
                    }))
                        .then(() => {
                            expect(store.getState().discussions.currentDiscussion?.comments).toEqual([comment]);
                            mockedAPIs.putDiscussionComment.mockRejectedValue(undefined);
                            store.dispatch(editComment({
                                discussion_id: -1,
                                comment_id: comment.comment_id,
                                text: comment.text,
                            }))
                                .then(() => {
                                    expect(store.getState().discussions.hasError).toEqual(true);
                                });
                        });
                });
            });
    });

    it("Should fetch discussions correctly", () => {
        const discussion : IDiscussion = discussionFactory();
        const comment : IComment = commentFactory();
        mockedAPIs.deleteDiscussionComment.mockResolvedValue([comment]);
        mockedAPIs.getDiscussion.mockResolvedValue(discussion);
        store.dispatch(removeComment({ discussion_id: -1, comment_id: -1 })).then(() => {
            expect(store.getState().discussions.isLoading).toEqual(true);
            store.dispatch(fetchDiscussion(1)).then(() => {
                store.dispatch(removeComment({ discussion_id: -1, comment_id: -1 })).then(() => {
                    expect(store.getState().discussions.currentDiscussion?.comments).toEqual([comment]);
                    mockedAPIs.deleteDiscussionComment.mockRejectedValue(undefined);
                    store.dispatch(removeComment({ discussion_id: -1, comment_id: -1 })).then(() => {
                        expect(store.getState().discussions.hasError).toEqual(true);
                    });
                });
            });
        });
    });
});

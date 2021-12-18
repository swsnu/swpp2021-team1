import { configureStore } from "@reduxjs/toolkit";

import Factory from "../../mocks/dataGenerator";
import {
    deletePostCommentHE,
    deletePostHE,
    getPostCommentsHE,
    getPostHE,
    getRepoPostsHE,
    getUserPostsHE,
    postPostCommentHE,
    postRepoPostHE,
    putPostCommentHE,
    putPostHE,
} from "../../mocks/handlers";
import server from "../../mocks/server";
import postsReducer, {
    fetchPostComments,
    fetchRepoPosts,
    fetchSinglePost,
    fetchUserPosts,
    newPostComment,
    newRepoPost,
    postCommentDeleted,
    postCommentEdited,
    postDeleted,
    postEdited,
} from "./postsSlice";

const fact = new Factory();

describe("postsSlice", () => {
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers);
    afterAll(() => server.close());

    let store = configureStore({
        reducer: {
            auth: postsReducer,
        },
    });

    beforeEach(() => {
        store = configureStore({
            reducer: {
                auth: postsReducer,
            },
        });
    });
    it("should handle fetch post comments", async () => {
        const response = await store.dispatch(fetchPostComments(123));
        expect(response.meta.requestStatus).toBe("fulfilled");
    });
    it("should handle fetch post comments exception", async () => {
        server.use(getPostCommentsHE);
        const response = await store.dispatch(fetchPostComments(123));
        expect(response.meta.requestStatus).toBe("rejected");
    });
    it("should handle new post comment", async () => {
        const response = await store.dispatch(newPostComment({ postId: 1, content: "abc" }));
        expect(response.meta.requestStatus).toEqual("fulfilled");
    });
    it("should handle new post comment (currentPost exists)", async () => {
        store.dispatch(fetchSinglePost(2));
        const response = await store.dispatch(newPostComment({ postId: 1, content: "abc" }));
        expect(response.meta.requestStatus).toEqual("fulfilled");
    });
    it("should handle new post comment exception", async () => {
        server.use(postPostCommentHE);
        const response = await store.dispatch(newPostComment({ postId: 1, content: "abc" }));
        expect(response.meta.requestStatus).toEqual("rejected");
    });

    it("should handle post comment edit", async () => {
        const response = await store.dispatch(postCommentEdited({ postId: 123, commentId: 23, content: "as" }));
        expect(response.meta.requestStatus).toEqual("fulfilled");
    });
    it("should handle post comment edit(currentPost exists)", async () => {
        store.dispatch(fetchSinglePost(2));
        const response = await store.dispatch(postCommentEdited({ postId: 123, commentId: 23, content: "as" }));
        expect(response.meta.requestStatus).toEqual("fulfilled");
    });
    it("should handle post comment edit exception", async () => {
        server.use(putPostCommentHE);
        const response = await store.dispatch(postCommentEdited({ postId: 123, commentId: 23, content: "as" }));
        expect(response.meta.requestStatus).toEqual("rejected");
    });

    it("should handle post comment delete", async () => {
        const response = await store.dispatch(postCommentDeleted({ postId: 1, commentId: 2 }));
        expect(response.meta.requestStatus).toEqual("fulfilled");
    });
    it("should handle post comment delete", async () => {
        await store.dispatch(fetchSinglePost(1));
        const response = await store.dispatch(postCommentDeleted({ postId: 1, commentId: 2 }));
        expect(response.meta.requestStatus).toEqual("fulfilled");
    });
    it("should handle post comment delete exception", async () => {
        server.use(deletePostCommentHE);
        const response = await store.dispatch(postCommentDeleted({ postId: 1, commentId: 2 }));
        expect(response.meta.requestStatus).toEqual("rejected");
    });

    it("should handle fetch user posts", async () => {
        const response = await store.dispatch(fetchUserPosts("abc"));
        expect(response.meta.requestStatus).toEqual("fulfilled");
    });
    it("should handle fetch user posts exception", async () => {
        server.use(getUserPostsHE);
        const response = await store.dispatch(fetchUserPosts("abc"));
        expect(response.meta.requestStatus).toEqual("rejected");
    });

    it("should handle fetch repo posts", async () => {
        const response = await store.dispatch(fetchRepoPosts(1));
        expect(response.meta.requestStatus).toEqual("fulfilled");
    });
    it("should handle fetch repo posts exception", async () => {
        server.use(getRepoPostsHE);
        const response = await store.dispatch(fetchRepoPosts(1));
        expect(response.meta.requestStatus).toEqual("rejected");
    });

    it("should handle new repo post", async () => {
        const response = await store.dispatch(newRepoPost({
            repo_id: 1, title: "a", text: "a", photos: [fact.photoGen(), fact.photoGen()],
        }));
        expect(response.meta.requestStatus).toEqual("fulfilled");
    });
    it("should handle new repo post exception", async () => {
        server.use(postRepoPostHE);
        const response = await store.dispatch(newRepoPost({
            repo_id: 1, title: "a", text: "a", photos: [fact.photoGen(), fact.photoGen()],
        }));
        expect(response.meta.requestStatus).toEqual("rejected");
    });

    it("should handle fetch single post", async () => {
        const response = await store.dispatch(fetchSinglePost(1));
        expect(response.meta.requestStatus).toEqual("fulfilled");
    });
    it("should handle fetch single post exception", async () => {
        server.use(getPostHE);
        const response = await store.dispatch(fetchSinglePost(1));
        expect(response.meta.requestStatus).toEqual("rejected");
    });

    it("should handle post edit", async () => {
        const response = await store.dispatch(postEdited({
            post_id: 1, title: "a", text: "b", photos: [fact.photoGen(), fact.photoGen()],
        }));
        expect(response.meta.requestStatus).toEqual("fulfilled");
    });
    it("should handle post edit exception", async () => {
        server.use(putPostHE);
        const response = await store.dispatch(postEdited({
            post_id: 1, title: "a", text: "b", photos: [fact.photoGen(), fact.photoGen()],
        }));
        expect(response.meta.requestStatus).toEqual("rejected");
    });

    it("should handle post delete", async () => {
        const response = await store.dispatch(postDeleted(1));
        expect(response.meta.requestStatus).toEqual("fulfilled");
    });
    it("should handle post delete exception", async () => {
        server.use(deletePostHE);
        const response = await store.dispatch(postDeleted(1));
        expect(response.meta.requestStatus).toEqual("rejected");
    });
});

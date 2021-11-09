import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import store, { RootState } from "../../app/store";
import {
    deleteDiscussionComment, deletePostComment,
    getDiscussionComment, getDiscussionComments,
    getPostComment, getPostComments,
    postDiscussionComment, postPostComment,
    putDiscussionComment, putPostComment,
} from "../../common/APIs";
import { IComment } from "../../common/Interfaces";

const commentsAdapter = createEntityAdapter<IComment>({
    selectId: (comment) => comment.comment_id,
    //  sortComparer: (a, b) => a
});

// interface CommentState {
//    entities: [],
//    loading: "idle" | "pending" | "succeeded" | "failed"
// }

export const fetchComments = createAsyncThunk<IComment[], {
    articleId: number, articleType: "discussion" | "post"}>(
        "comment/fetchArticleComments",
        async ({ articleId, articleType }) => {
            let comments: IComment[];
            if (articleType === "discussion") {
                comments = await getDiscussionComments(articleId);
            }
            else {
                comments = await getPostComments(articleId);
            }
            return comments;
        },
    );

export const fetchSingleComment = createAsyncThunk<IComment, {
    articleId: number, articleType: "discussion" | "post", commentId: number}>(
        "comment/fetchSingleComment",
        async ({ articleId, articleType, commentId }) => {
            let comment: IComment;
            if (articleType === "discussion") comment = await getDiscussionComment(articleId, commentId);
            else comment = await getPostComment(articleId, commentId);
            return comment;
        },
    );

export const newCommentPosted = createAsyncThunk<IComment[], {
    articleId: number, articleType: "discussion" | "Post", content: string}>(
        "comment/newCommentPosted",
        async ({ articleId, articleType, content }) => {
            let comments = [];
            if (articleType === "discussion") {
                comments = await postDiscussionComment(articleId, content);
            }
            else {
                comments = await postPostComment(articleId, content);
            }
            return comments;
        },
    );

export const commentEdited = createAsyncThunk<IComment[], {
    articleId: number, articleType: "discussion" | "Post", commentId: number, content: string}>(
        "comment/commentEdited",
        async ({
            articleId, articleType, commentId, content,
        }) => {
            let comments = [];
            if (articleType === "discussion") {
                comments = await putDiscussionComment(articleId, commentId, content);
            }
            else {
                comments = await putPostComment(articleId, commentId, content);
            }
            return comments;
        },
    );

export const commentDeleted = createAsyncThunk<null, {
    articleId: number, articleType: "discussion" | "Post", commentId: number}>(
        "comment/commentDeleted",
        async ({ articleId, articleType, commentId }) => {
            if (articleType === "discussion") await deleteDiscussionComment(articleId, commentId);
            else await deletePostComment(articleId, commentId);
            return null;
        },
    );

export const commentsSlice = createSlice({
    name: "comments",
    initialState: commentsAdapter.getInitialState({
        loading: "idle",
    }),
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchComments.pending, (state, action) => {
            state.loading = "pending";
        });
        builder.addCase(fetchComments.fulfilled, (state, action) => {
            commentsAdapter.setAll(state, action.payload);
            state.loading = "succeeded";
        });
        builder.addCase(fetchComments.rejected, (state, action) => {
            state.loading = "failed";
        });
        builder.addCase(newCommentPosted.pending, (state, action) => {
            state.loading = "pending";
        });
        builder.addCase(newCommentPosted.fulfilled, (state, action) => {
            commentsAdapter.setAll(state, action.payload);
            state.loading = "succeeded";
        });
        builder.addCase(newCommentPosted.rejected, (state, action) => {
            state.loading = "failed";
        });
        builder.addCase(commentEdited.pending, (state, action) => {
            state.loading = "pending";
        });
        builder.addCase(commentEdited.fulfilled, (state, action) => {
            commentsAdapter.setAll(state, action.payload);
            state.loading = "succeeded";
        });
        builder.addCase(commentEdited.rejected, (state, action) => {
            state.loading = "failed";
        });
        builder.addCase(commentDeleted.pending, (state, action) => {
            state.loading = "pending";
        });
        builder.addCase(commentDeleted.fulfilled, (state, action) => {
            state.loading = "succeeded";
        });
        builder.addCase(commentDeleted.rejected, (state, action) => {
            state.loading = "failed";
        });
    },
});

export default commentsSlice.reducer;
const commentsSelectors = commentsAdapter.getSelectors<RootState>((state) => state.comments);
export const allComments = commentsSelectors.selectAll(store.getState());
export const loadingStatus = store.getState().comments.loading;

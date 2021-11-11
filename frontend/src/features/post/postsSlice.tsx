import {
    createAsyncThunk, createEntityAdapter, createSlice, EntityState,
} from "@reduxjs/toolkit";
import { ReactReduxContext } from "react-redux";
import { useContext } from "react";
import { RootState } from "../../app/store";
import { IComment, IPhoto, IPost } from "../../common/Interfaces";
import {
    getPostComments, getPostComment, postPostComment, putPostComment, deletePostComment,
    getUserPosts, getRepositoryPosts, postPost, getPost, putPost, deletePost,
} from "../../common/APIs";

const postsAdapter = createEntityAdapter<IPost>({
    selectId: (post: IPost) => post.post_id,
    //  sortComparer: (a, b) => a
});

// const commentsAdapter = createEntityAdapter<IComment>({
//     selectId: (comment: IComment) => comment.comment_id,
// });

export const fetchPostComments = createAsyncThunk<{postId: number, comments: IComment[]}, {
    postId: number}>(
        "post/fetchPostComments",
        async ({ postId }) => {
            const comments = await getPostComments(postId);
            return { postId, comments };
        },
    );

// export const fetchPostComment = createAsyncThunk<IComment, {
//     postId: number, commentId: number}>(
//         "post/fetchSingleComment",
//         async ({ postId, commentId }) => (await getPostComment(postId, commentId)),
//     );

export const newPostComment = createAsyncThunk<{postId: number, comments: IComment[]}, {
    postId: number, content: string}>(
        "post/newCommentPosted",
        async ({ postId, content }) => {
            const comments = await postPostComment(postId, content);
            return { postId, comments };
        },
    );

export const postCommentEdited = createAsyncThunk<{postId: number, comments: IComment[]}, {
    postId: number, commentId: number, content: string}>(
        "post/commentEdited",
        async ({ postId, commentId, content }) => {
            const comments = await putPostComment(postId, commentId, content);
            return { postId, comments };
        },
    );

export const postCommentDeleted = createAsyncThunk<{postId: number, comments: IComment[]}, {
    postId: number, commentId: number}>(
        "post/commentDeleted",
        async ({ postId, commentId }) => {
            const comments = await deletePostComment(postId, commentId);
            return { postId, comments };
        },
    );

export const fetchUserPosts = createAsyncThunk<IPost[], string>(
    "post/fetchUserPosts",
    async (username: string) => (await getUserPosts(username)),
);

export const fetchRepoPosts = createAsyncThunk<IPost[], number>(
    "post/fetchRepoPosts",
    async (repoId: number) => (await getRepositoryPosts(repoId)),
);

export const newRepoPost = createAsyncThunk<
IPost, {repo_id: number, title: string, text: string, photos: IPhoto[]}>(
    "post/newRepoPost",
    async ({
        repo_id, title, text, photos,
    }) => (await postPost(repo_id, { title, text, photos })),
);

export const fetchSinglePost = createAsyncThunk<IPost, number>(
    "post/fetchSinglePost",
    async (postId: number) => (await getPost(postId)),
);

export const postEdited = createAsyncThunk<IPost, {
    post_id: number, title: string, text: string, photos: IPhoto[]
}>(
    "post/postEdited",
    async ({
        post_id, title, text, photos,
    }) => (await putPost(post_id, title, text, photos)),
);

export const postDeleted = createAsyncThunk<number, number>(
    "post/postDeleted",
    async (postId) => {
        await deletePost(postId);
        return postId;
    },
);

export const postsSlice = createSlice({
    name: "posts",
    initialState: postsAdapter.getInitialState<{
        loading: "idle" | "pending" | "succeeded" | "failed",
        currentPost: IPost | null
    }>({
        loading: "idle",
        currentPost: null,
    }),
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchUserPosts.pending, (state, action) => {
            state.loading = "pending";
        });
        builder.addCase(fetchUserPosts.fulfilled, (state, action) => {
            postsAdapter.setAll(state, action.payload);
            state.loading = "succeeded";
        });
        builder.addCase(fetchUserPosts.rejected, (state, action) => {
            state.loading = "failed";
        });
        builder.addCase(fetchRepoPosts.pending, (state, action) => {
            state.loading = "pending";
        });
        builder.addCase(fetchRepoPosts.fulfilled, (state, action) => {
            postsAdapter.setAll(state, action.payload);
            state.loading = "succeeded";
        });
        builder.addCase(fetchRepoPosts.rejected, (state, action) => {
            state.loading = "failed";
        });
        // builder.addCase(newRepoPost.pending, (state, action) => {
        //     state.loading = "pending";
        // });
        builder.addCase(newRepoPost.fulfilled, (state, action) => {
            postsAdapter.addOne(state, action.payload);
            state.currentPost = action.payload;
            // state.loading = "succeeded";
        });
        // builder.addCase(newRepoPost.rejected, (state, action) => {
        //     state.loading = "failed";
        // });
        // builder.addCase(postEdited.pending, (state, action) => {
        //     state.loading = "pending";
        // });
        builder.addCase(postEdited.fulfilled, (state, action) => {
            postsAdapter.setOne(state, action.payload);
            // state.loading = "succeeded";
        });
        // builder.addCase(postEdited.rejected, (state, action) => {
        //     state.loading = "failed";
        // });
        // builder.addCase(postDeleted.pending, (state, action) => {
        //     state.loading = "pending";
        // });
        builder.addCase(postDeleted.fulfilled, (state, action) => {
            // state.loading = "succeeded";
            postsAdapter.removeOne(state, action.payload);
        });
        // builder.addCase(postDeleted.rejected, (state, action) => {
        //     state.loading = "failed";
        // });

        // builder.addCase(fetchPostComments.pending, (state, action) => {
        //     state.loading = "pending";
        // });
        builder.addCase(fetchPostComments.fulfilled, (state, action) => {
            const { postId, comments } = action.payload;
            postsAdapter.updateOne(state, { id: postId, changes: { comments } });
            // state.loading = "succeeded";
        });
        // builder.addCase(fetchPostComments.rejected, (state, action) => {
        //     state.loading = "failed";
        // });

        // builder.addCase(fetchPostComment.pending, (state, action) => {
        //     state.loading = "pending";
        // });
        // builder.addCase(fetchPostComment.fulfilled, (state, action) => {
        //     commentsAdapter.setAll(state, action.payload);
        //     state.loading = "succeeded";
        // });
        // builder.addCase(fetchPostComment.rejected, (state, action) => {
        //     state.loading = "failed";
        // });

        // builder.addCase(newPostComment.pending, (state, action) => {
        //     state.loading = "pending";
        // });
        builder.addCase(newPostComment.fulfilled, (state, action) => {
            const { postId, comments } = action.payload;
            postsAdapter.updateOne(state, { id: postId, changes: { comments } });
            // state.loading = "succeeded";
        });
        // builder.addCase(newPostComment.rejected, (state, action) => {
        // });
        // builder.addCase(postCommentEdited.pending, (state, action) => {
        // });
        builder.addCase(postCommentEdited.fulfilled, (state, action) => {
            const { postId, comments } = action.payload;
            postsAdapter.updateOne(state, { id: postId, changes: { comments } });
        });
        // builder.addCase(postCommentEdited.rejected, (state, action) => {
        // });
        // builder.addCase(postCommentDeleted.pending, (state, action) => {
        // });
        builder.addCase(postCommentDeleted.fulfilled, (state, action) => {
            const { postId, comments } = action.payload;
            postsAdapter.updateOne(state, { id: postId, changes: { comments } });
        });
        // builder.addCase(postCommentDeleted.rejected, (state, action) => {
        // });
        // builder.addCase(fetchSinglePost.pending, (state, action) => {
        // });
        builder.addCase(fetchSinglePost.fulfilled, (state, action) => {
            state.currentPost = action.payload;
        });
        // builder.addCase(fetchSinglePost.rejected, (state, action) => {
        // });
    },
});

export default postsSlice.reducer;
export const postsSelectors = postsAdapter.getSelectors<RootState>((state) => state.posts);

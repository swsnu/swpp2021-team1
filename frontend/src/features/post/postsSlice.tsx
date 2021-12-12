import {
    createAsyncThunk, createEntityAdapter, createSlice, PayloadAction,
} from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import {
    deletePost,
    deletePostComment,
    getPost,
    getPostComments,
    getRepositoryPosts,
    getUserPosts,
    postPost,
    postPostComment,
    putPost,
    putPostComment,
} from "../../common/APIs";
import {
    IComment, IPhoto, IPost, PostType,
} from "../../common/Interfaces";

const postsAdapter = createEntityAdapter<IPost>({
    selectId: (post: IPost) => post.post_id,
    //  sortComparer: (a, b) => a
});

export const fetchPostComments = createAsyncThunk<{postId: number, comments: IComment[]}, number>(
    "post/fetchPostComments",
    async (postId: number) => {
        const comments = await getPostComments(postId);
        return { postId, comments };
    },
);

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
    async (username: string) => getUserPosts(username),
);

export const fetchRepoPosts = createAsyncThunk<IPost[], number>(
    "post/fetchRepoPosts",
    async (repoId: number) => getRepositoryPosts(repoId),
);

export interface PhotoWithLocalTag {
    photo_id: number,
    local_tag: string
}

export const newRepoPost = createAsyncThunk<
IPost, {repo_id: number, title: string, text: string, photos: PhotoWithLocalTag[]}>(
    "post/newRepoPost",
    async ({
        repo_id, title, text, photos,
    }) => postPost(repo_id, { title, text, photos }),
);

export const fetchSinglePost = createAsyncThunk<IPost, number>(
    "post/fetchSinglePost",
    async (postId: number) => getPost(postId),
);

export const postEdited = createAsyncThunk<IPost, {
    post_id: number, title: string, text: string, photos: IPhoto[]
}>(
    "post/postEdited",
    async ({
        post_id, title, text, photos,
    }) => putPost(post_id, title, text, photos),
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
        builder.addCase(fetchUserPosts.pending, (state) => {
            state.loading = "pending";
        });
        builder.addCase(fetchUserPosts.fulfilled, (state, action) => {
            postsAdapter.setAll(state, action.payload);
            state.loading = "succeeded";
        });
        builder.addCase(fetchUserPosts.rejected, (state) => {
            state.loading = "failed";
        });
        builder.addCase(fetchRepoPosts.pending, (state) => {
            state.loading = "pending";
        });
        builder.addCase(fetchRepoPosts.fulfilled, (state, action) => {
            postsAdapter.setAll(state, action.payload);
            state.loading = "succeeded";
        });
        builder.addCase(fetchRepoPosts.rejected, (state) => {
            state.loading = "failed";
        });
        builder.addCase(newRepoPost.fulfilled, (state, action) => {
            postsAdapter.addOne(state, action.payload);
            state.currentPost = action.payload;
        });
        builder.addCase(postEdited.fulfilled, (state, action) => {
            postsAdapter.setOne(state, action.payload);
        });
        builder.addCase(postDeleted.fulfilled, (state, action: PayloadAction<number>) => {
            postsAdapter.removeOne(state, action.payload);
        });
        builder.addCase(fetchPostComments.fulfilled, (state, action) => {
            const { postId, comments } = action.payload;
            postsAdapter.updateOne(state, { id: postId, changes: { comments } });
        });
        builder.addCase(newPostComment.fulfilled, (state, action) => {
            const { postId, comments } = action.payload;
            postsAdapter.updateOne(state, { id: postId, changes: { comments } });
            if (state.currentPost) {
                state.currentPost.comments = action.payload.comments;
            }
        });
        builder.addCase(postCommentEdited.fulfilled, (state, action) => {
            const { postId, comments } = action.payload;
            postsAdapter.updateOne(state, { id: postId, changes: { comments } });
            if (state.currentPost) {
                state.currentPost.comments = action.payload.comments;
            }
        });
        builder.addCase(postCommentDeleted.fulfilled, (state, action) => {
            const { postId, comments } = action.payload;
            postsAdapter.updateOne(state, { id: postId, changes: { comments } });
            if (state.currentPost) {
                state.currentPost.comments = action.payload.comments;
            }
        });
        builder.addCase(fetchSinglePost.fulfilled, (state, action) => {
            state.currentPost = action.payload;
            state.loading = "succeeded";
        });
        builder.addCase(fetchSinglePost.rejected, (state) => {
            state.loading = "failed";
        });
    },
});

export default postsSlice.reducer;
export const postsSelectors = postsAdapter.getSelectors<RootState>((state) => state.posts);

import {
    createAsyncThunk, createEntityAdapter, createSlice, EntityState,
} from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { IComment, IPhoto, IPost } from "../../common/Interfaces";
import {
    getPostComments, postPostComment, putPostComment, deletePostComment,
    getUserPosts, getRepositoryPosts, postPost, getPost, putPost, deletePost,
} from "../../common/APIs";

const postsAdapter = createEntityAdapter<IPost>({
    selectId: (post: IPost) => post.post_id,
    //  sortComparer: (a, b) => a
});

export const fetchPostComments = createAsyncThunk<{postId: number, comments: IComment[]}, {
    postId: number}>(
        "post/fetchPostComments",
        async ({ postId }) => {
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
        builder.addCase(newRepoPost.fulfilled, (state, action) => {
            postsAdapter.addOne(state, action.payload);
            state.currentPost = action.payload;
        });
        builder.addCase(postEdited.fulfilled, (state, action) => {
            postsAdapter.setOne(state, action.payload);
        });
        builder.addCase(postDeleted.fulfilled, (state, action) => {
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
        });
    },
});

export default postsSlice.reducer;
export const postsSelectors = postsAdapter.getSelectors<RootState>((state) => state.posts);

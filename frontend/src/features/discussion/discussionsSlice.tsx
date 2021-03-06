import {
    createAsyncThunk, createSlice, PayloadAction, SliceCaseReducers,
} from "@reduxjs/toolkit";
import {
    IComment, IDiscussion,
} from "../../common/Interfaces";
import {
    deleteDiscussion, deleteDiscussionComment,
    getDiscussion,
    getDiscussions, postDiscussionComment,
    postDiscussions, putDiscussion, putDiscussionComment,
} from "../../common/APIs";

export const fetchDiscussions = createAsyncThunk<IDiscussion[], number>( // added
    "discussions/list",
    async (repo_id) => // payload creator
        getDiscussions(repo_id),
);

export const createDiscussion = createAsyncThunk<IDiscussion, {repo_id : number, discussion : IDiscussion}>( // added
    "discussions/add",
    async ({ repo_id, discussion }) => // payload creator
        postDiscussions(repo_id, discussion),
);

export const fetchDiscussion = createAsyncThunk<IDiscussion, number>( // added
    "discussion/fetch",
    async (discussion_id) => // payload creator
        getDiscussion(discussion_id),
);

export const editDiscussion = createAsyncThunk<IDiscussion, IDiscussion>( // added
    "discussion/edit",
    async (discussion) => // payload creator
        putDiscussion(discussion),
);

export const removeDiscussion = createAsyncThunk<void, number>( // added
    "discussion/remove",
    async (discussion_id) => // payload creator
        deleteDiscussion(discussion_id),
);

export const createComment = createAsyncThunk<IComment[], {discussion_id : number, text : string}>( // added
    "discussion/comments/add",
    async ({ discussion_id, text }) => // payload creator
        postDiscussionComment(discussion_id, text),
);

export const editComment = createAsyncThunk<IComment[],
    { discussion_id : number, comment_id : number, text : string }>( // added
        "discussion/comments/edit",
        async ({ discussion_id, comment_id, text }) => // payload creator
            putDiscussionComment(discussion_id, comment_id, text),
    );

export const removeComment = createAsyncThunk<IComment[], {discussion_id : number, comment_id : number}>( // added
    "discussion/comments/remove",
    async ({ discussion_id, comment_id }) => // payload creator
        deleteDiscussionComment(discussion_id, comment_id),
);

export const discussionsInitialState: DiscussionsState = {
    isLoading: true,
    hasError: false,
    currentDiscussion: null,
    discussionList: [],
};

interface DiscussionsState {
    isLoading : boolean;
    hasError : boolean;
    currentDiscussion : IDiscussion|null;
    discussionList : IDiscussion[];
}

const discussionsSlice = createSlice<DiscussionsState, SliceCaseReducers<DiscussionsState>>({
    name: "discussions",
    initialState: discussionsInitialState,
    reducers: {
        toBeLoaded: (state : DiscussionsState) => {
            state.isLoading = true;
        },
        handleError: (state : DiscussionsState) => {
            state.hasError = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchDiscussions.pending, (state: DiscussionsState) => {
            state.isLoading = true;
            state.hasError = false;
        });
        builder.addCase(fetchDiscussions.fulfilled, (state: DiscussionsState, action: PayloadAction<IDiscussion[]>) => {
            state.isLoading = false;
            state.hasError = false;
            state.discussionList = action.payload;
        });
        builder.addCase(fetchDiscussions.rejected, (state: DiscussionsState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(createDiscussion.pending, (state: DiscussionsState) => {
            state.isLoading = true;
            state.hasError = false;
        });
        builder.addCase(createDiscussion.fulfilled, (state: DiscussionsState, action: PayloadAction<IDiscussion>) => {
            state.isLoading = false;
            state.hasError = false;
            state.currentDiscussion = action.payload;
        });
        builder.addCase(createDiscussion.rejected, (state: DiscussionsState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(fetchDiscussion.pending, (state: DiscussionsState) => {
            state.isLoading = true;
            state.hasError = false;
        });
        builder.addCase(fetchDiscussion.fulfilled, (state: DiscussionsState, action: PayloadAction<IDiscussion>) => {
            state.isLoading = false;
            state.hasError = false;
            state.currentDiscussion = action.payload;
        });
        builder.addCase(fetchDiscussion.rejected, (state: DiscussionsState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(editDiscussion.pending, (state: DiscussionsState) => {
            state.hasError = false;
        });
        builder.addCase(editDiscussion.fulfilled, (state: DiscussionsState, action: PayloadAction<IDiscussion>) => {
            state.hasError = false;
            state.currentDiscussion = action.payload;
        });
        builder.addCase(editDiscussion.rejected, (state: DiscussionsState) => {
            state.hasError = true;
        });

        builder.addCase(removeDiscussion.pending, (state: DiscussionsState) => {
            state.isLoading = true;
            state.hasError = false;
        });
        builder.addCase(removeDiscussion.fulfilled, (state: DiscussionsState) => {
            state.isLoading = false;
            state.hasError = false;
        });
        builder.addCase(removeDiscussion.rejected, (state: DiscussionsState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(createComment.pending, (state: DiscussionsState) => {
            state.hasError = false;
        });
        builder.addCase(createComment.fulfilled, (state: DiscussionsState, action: PayloadAction<IComment[]>) => {
            state.hasError = false;
            if (state.currentDiscussion) {
                state.currentDiscussion = { ...state.currentDiscussion, comments: action.payload };
            }
        });
        builder.addCase(createComment.rejected, (state: DiscussionsState) => {
            state.hasError = true;
        });

        builder.addCase(editComment.pending, (state: DiscussionsState) => {
            state.hasError = false;
        });
        builder.addCase(editComment.fulfilled, (state: DiscussionsState, action: PayloadAction<IComment[]>) => {
            state.hasError = false;
            if (state.currentDiscussion) {
                state.currentDiscussion = { ...state.currentDiscussion, comments: action.payload };
            }
        });
        builder.addCase(editComment.rejected, (state: DiscussionsState) => {
            state.hasError = true;
        });

        builder.addCase(removeComment.pending, (state: DiscussionsState) => {
            state.hasError = false;
        });
        builder.addCase(removeComment.fulfilled, (state: DiscussionsState, action: PayloadAction<IComment[]>) => {
            state.hasError = false;
            if (state.currentDiscussion) {
                state.currentDiscussion = { ...state.currentDiscussion, comments: action.payload };
            }
        });
        builder.addCase(removeComment.rejected, (state: DiscussionsState) => {
            state.hasError = true;
        });
    },
});

export type { DiscussionsState };
export const { toBeLoaded, handleError } = discussionsSlice.actions;
export default discussionsSlice.reducer;

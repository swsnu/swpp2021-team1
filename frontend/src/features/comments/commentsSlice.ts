import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { getDiscussionComments } from "../../common/APIs";
import { IComment } from "../../common/Interfaces";

const commentsAdapter = createEntityAdapter<IComment>({
    selectId: (comment) => comment.comment_id,
    //  sortComparer: (a, b) => a
});

// interface CommentState {
//    entities: [],
//    loading: "idle" | "pending" | "succeeded" | "failed"
// }

const fetchArticleComments = createAsyncThunk<IComment[], {articleId: number, articleType: "discussion" | "post"}>(
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

const commentsSlice = createSlice({
    name: "comments",
    initialState: commentsAdapter.getInitialState({
        loading: "idle",
    }),
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchArticleComments.fulfilled, (state, action) => {
            commentsAdapter.setAll(state, action.payload);
        });
    },
});

export default commentsSlice.reducer;
const commentsSelectors = commentsAdapter.getSelectors<RootState>((state) => state.comments);

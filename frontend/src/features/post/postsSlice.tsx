import { createSlice, PayloadAction, SliceCaseReducers } from "@reduxjs/toolkit";
import { IPost } from "../../common/Interfaces";
import { reposInitialState, ReposState } from "../repository/reposSlice";

interface PostsState {
    isLoading : boolean;
    hasError : boolean;
    currentPost : IPost|null;
    postList : IPost[];
}

export const postsInitialState: PostsState = {
    isLoading: true,
    hasError: false,
    currentPost: null,
    postList: [],
};

const postsSlice = createSlice<PostsState, SliceCaseReducers<PostsState>>({
    name: "posts",
    initialState: postsInitialState,
    reducers: {
        toBeLoaded: (state : PostsState, action: PayloadAction<null>) => {
            state.isLoading = false;
        },
        handleError: (state : PostsState, action: PayloadAction<null>) => {
            state.hasError = false;
        },
    },
    extraReducers: {

    },
});

export type { PostsState };
export const { toBeLoaded, handleError } = postsSlice.actions;
export default postsSlice.reducer;

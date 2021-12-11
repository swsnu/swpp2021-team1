import {
    createAsyncThunk,
    createSlice,
    PayloadAction,
    SliceCaseReducers,
} from "@reduxjs/toolkit";
import { IRepositorySearch, IUser } from "../../../common/Interfaces";
import { getRegionSearch, getRepositorySearch, getUserSearch } from "../../../common/APIs";

export const searchUser = createAsyncThunk<IUser[], string>(
    "search/user",
    async (query) => // payload creator
        await getUserSearch(query),
);

export const searchRepository = createAsyncThunk<IRepositorySearch[], string>(
    "search/repo",
    async (query) => // payload creator
        await getRepositorySearch(query),
);

export const searchRegion = createAsyncThunk<IRepositorySearch[], string>(
    "search/region",
    async (query) => // payload creator
        await getRegionSearch(query),
);

export const searchInitState : SearchState = {
    isLoading: false,
    userResult: [],
    repositoryResult: [],
    searchInfo: null,
};

interface SearchState {
    isLoading : boolean,
    userResult : IUser[];
    repositoryResult : IRepositorySearch[]
    searchInfo : string|null,
}

export const searchSlice = createSlice<SearchState, SliceCaseReducers<SearchState>>({
    name: "labels",
    initialState: searchInitState,
    reducers: {
        saveSearchInfo: (state : SearchState, action : PayloadAction<string>) => {
            state.searchInfo = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(searchUser.pending, (state : SearchState) => {
            state.isLoading = true;
        });
        builder.addCase(searchUser.fulfilled, (state : SearchState, action : PayloadAction<IUser[]>) => {
            state.isLoading = false;
            state.userResult = action.payload;
            state.repositoryResult = [];
        });

        builder.addCase(searchRepository.pending, (state : SearchState) => {
            state.isLoading = true;
        });
        builder.addCase(searchRepository.fulfilled, (state : SearchState,
            action : PayloadAction<IRepositorySearch[]>) => {
            state.isLoading = false;
            state.repositoryResult = action.payload;
            state.userResult = [];
        });

        builder.addCase(searchRegion.pending, (state : SearchState) => {
            state.isLoading = true;
        });
        builder.addCase(searchRegion.fulfilled, (state : SearchState,
            action : PayloadAction<IRepositorySearch[]>) => {
            state.isLoading = false;
            state.userResult = [];
            state.repositoryResult = action.payload;
        });
    },
});

export type { SearchState };
export const { saveSearchInfo } = searchSlice.actions;
export default searchSlice.reducer;

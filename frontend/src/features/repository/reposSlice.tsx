import {
    createAsyncThunk,
    createSlice,
    PayloadAction,
    SliceCaseReducers,
} from "@reduxjs/toolkit";
import { IRepository, IUser } from "../../common/Interfaces";
import {
    deleteRepository,
    getRepositories, getRepository, postCollaborators,
    postRepositories,
    putRepository,
} from "../../common/APIs";

export const fetchRepositories = createAsyncThunk<IRepository[], string>(
    "repos/list",
    async (username, thunkAPI) => // payload creator
        await getRepositories(username),

);

export const createRepository = createAsyncThunk<IRepository, IRepository>(
    "repos/add",
    async (repo, thunkAPI) => await postRepositories(repo),
);

export const editRepository = createAsyncThunk<IRepository, IRepository>(
    "repos/edit",
    async (repo, thunkAPI) => await putRepository(repo),
);

export const removeRepository = createAsyncThunk<void, number>(
    "repos/delete",
    async (repo_id, thunkAPI) => {
        await deleteRepository(repo_id);
    },
);

export const addCollaborators = createAsyncThunk<void, {repoID : number, users : string[]}>(
    "repos/collaborators",
    async ({ repoID, users }, thunkAPI) => {
        await postCollaborators(repoID, users);
    },
);

export const fetchRepository = createAsyncThunk<IRepository, number>(
    "repos/collaborators",
    async (repoID, thunkAPI) => await getRepository(repoID),
);

interface ReposState {
    isLoading : boolean;
    hasError : boolean;
    currentRepo : IRepository|null;
    repoList : IRepository[];
}

export const reposInitialState: ReposState = {
    isLoading: true,
    hasError: false,
    currentRepo: null,
    repoList: [],
};

const reposSlice = createSlice<ReposState, SliceCaseReducers<ReposState>>({
    name: "repos",
    initialState: reposInitialState,
    reducers: {
        toBeLoaded: (state : ReposState, action: PayloadAction<null>) => {
            state.isLoading = true;
        },
        handleError: (state : ReposState, action: PayloadAction<null>) => {
            state.hasError = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchRepositories.pending, (state: ReposState) => {
            state.isLoading = true;
            state.hasError = false;
        });

        builder.addCase(fetchRepositories.fulfilled, (state: ReposState, action : PayloadAction<IRepository[]>) => {
            state.isLoading = false;
            state.hasError = false;
            state.repoList = action.payload;
        });

        builder.addCase(fetchRepositories.rejected, (state: ReposState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(createRepository.pending, (state: ReposState) => {
            state.isLoading = true;
            state.hasError = false;
        });

        builder.addCase(createRepository.fulfilled, (state: ReposState, action : PayloadAction<IRepository>) => {
            state.isLoading = false;
            state.hasError = false;
            state.currentRepo = action.payload;
        });

        builder.addCase(createRepository.rejected, (state: ReposState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(addCollaborators.pending, (state : ReposState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(addCollaborators.fulfilled, (state : ReposState) => {
            state.isLoading = false;
            state.hasError = false;
        });

        builder.addCase(addCollaborators.rejected, (state : ReposState) => {
            state.isLoading = false;
            state.hasError = true;
        });
    },
});
export type { ReposState };
export const { toBeLoaded, handleError } = reposSlice.actions;
export default reposSlice.reducer;

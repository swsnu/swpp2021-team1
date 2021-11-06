import {
    createAsyncThunk,
    createSlice,
    current,
    PayloadAction,
    SliceCaseReducers,
} from "@reduxjs/toolkit";
import { IRepository, IUser } from "../../common/Interfaces";
import {
    deleteCollaborators,
    deleteRepository,
    getRepositories, getRepository, postCollaborators,
    postRepositories,
    putRepository,
} from "../../common/APIs";

export const fetchRepositories = createAsyncThunk<IRepository[], string>( // added
    "repos/list",
    async (username, thunkAPI) => // payload creator
        await getRepositories(username),

);

export const createRepository = createAsyncThunk<IRepository, IRepository>( // added
    "repos/add",
    async (repo, thunkAPI) => await postRepositories(repo),
);

export const editRepository = createAsyncThunk<IRepository, IRepository>( // added
    "repos/edit",
    async (repo, thunkAPI) => await putRepository(repo),
);

export const removeRepository = createAsyncThunk<void, number>( // added
    "repos/delete",
    async (repo_id, thunkAPI) => {
        await deleteRepository(repo_id);
    },
);

export const fetchRepository = createAsyncThunk<IRepository, number>( // added
    "repos/repo",
    async (repoID, thunkAPI) => await getRepository(repoID),
);

export const addCollaborators = createAsyncThunk<void, {repoID : number, users : string[]}>( // added
    "repos/collaborators",
    async ({ repoID, users }, thunkAPI) => {
        await postCollaborators(repoID, users);
    },
);

export const leaveRepository = createAsyncThunk<void, {username : string, repoID : number}>( // added
    "repos/leave",
    async ({ username, repoID }, thunkAPI) =>
        await deleteCollaborators(repoID, username),
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
            state.isLoading = true;
            state.hasError = false;
        });

        builder.addCase(addCollaborators.fulfilled, (state : ReposState) => {
            state.isLoading = false;
            state.hasError = false;
        });

        builder.addCase(addCollaborators.rejected, (state : ReposState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(editRepository.pending, (state : ReposState) => {
            state.isLoading = true;
            state.hasError = false;
        });

        builder.addCase(editRepository.fulfilled, (state : ReposState, action : PayloadAction<IRepository>) => {
            state.isLoading = false;
            state.hasError = false;
            state.currentRepo = action.payload;
        });

        builder.addCase(editRepository.rejected, (state : ReposState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(removeRepository.pending, (state : ReposState) => {
            state.isLoading = true;
            state.hasError = false;
        });

        builder.addCase(removeRepository.fulfilled, (state : ReposState) => {
            state.isLoading = false;
            state.hasError = false;
        });

        builder.addCase(removeRepository.rejected, (state : ReposState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(fetchRepository.pending, (state : ReposState) => {
            state.isLoading = true;
            state.hasError = false;
        });

        builder.addCase(fetchRepository.fulfilled, (state : ReposState, action : PayloadAction<IRepository>) => {
            state.isLoading = false;
            state.hasError = false;
            state.currentRepo = action.payload;
        });

        builder.addCase(fetchRepository.rejected, (state : ReposState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(leaveRepository.pending, (state : ReposState) => {
            state.isLoading = true;
            state.hasError = false;
        });

        builder.addCase(leaveRepository.fulfilled, (state : ReposState) => {
            state.isLoading = false;
            state.hasError = false;
        });

        builder.addCase(leaveRepository.rejected, (state : ReposState) => {
            state.isLoading = false;
            state.hasError = true;
        });
    },
});
export type { ReposState };
export const { toBeLoaded, handleError } = reposSlice.actions;
export default reposSlice.reducer;

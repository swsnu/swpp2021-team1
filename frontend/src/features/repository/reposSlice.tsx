import {
    createAsyncThunk,
    createSlice,
    PayloadAction,
    SliceCaseReducers,
} from "@reduxjs/toolkit";
import {
    IRepository, IUser, RepoTravel,
} from "../../common/Interfaces";
import {
    deleteCollaborators,
    deleteRepository,
    getRepositories, getRepository, postCollaborators, postRepoPost,
    postRepositories, postRoute, putRepoPost,
    putRepository,
} from "../../common/APIs";

export const fetchRepositories = createAsyncThunk<IRepository[], string>( // added
    "repos/list",
    async (username) => // payload creator
        getRepositories(username),

);

export const createRepository = createAsyncThunk<IRepository, IRepository>( // added
    "repos/add",
    async (repo) => postRepositories(repo),
);

export const editRepository = createAsyncThunk<IRepository, IRepository>( // added
    "repos/edit",
    async (repo) => putRepository(repo),
);

export const removeRepository = createAsyncThunk<void, number>( // added
    "repos/delete",
    async (repo_id) => {
        await deleteRepository(repo_id);
    },
);

export const fetchRepository = createAsyncThunk<IRepository, number>( // added
    "repos/repo",
    async (repoID) => getRepository(repoID),
);

export const addCollaborators = createAsyncThunk<IUser[], {repoID : number, users : {username: string}[]}>( // added
    "repos/collaborators",
    async ({ repoID, users }) =>
        postCollaborators(repoID, users),
);

export const leaveRepository = createAsyncThunk<void, {username : string, repoID : number}>( // added
    "repos/leave",
    async ({ username, repoID }) =>
        deleteCollaborators(repoID, username),
);

export const editRegion = createAsyncThunk<void, {repo_id : number, place_id : string}>( // added
    "repos/region",
    async ({ repo_id, place_id }) => // payload creator
        postRoute(repo_id, place_id, "region"),

);

export const forkRoute = createAsyncThunk<void, {repo_id : number, forked_repo_id : number}>( // added
    "repos/fork",
    async ({ repo_id, forked_repo_id }) => // payload creator
        postRoute(repo_id, forked_repo_id, "fork"),

);

export const createRepoPost = createAsyncThunk<void, number>( // added
    "repos/post",
    async (repo_id) => // payload creator
        postRepoPost(repo_id),

);

export const changeRepoPost = createAsyncThunk<void, {repo_id : number, travel : RepoTravel}>(
    "repos/post",
    async ({ repo_id, travel }) => { // payload creator
        await putRepoPost(repo_id, travel);
    },
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
        toBeLoaded: (state : ReposState) => {
            state.isLoading = true;
            state.currentRepo = null;
        },
        handleError: (state : ReposState) => {
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
            state.isLoading = true;
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

        builder.addCase(addCollaborators.fulfilled, (state : ReposState, action : PayloadAction<IUser[]>) => {
            state.isLoading = false;
            state.hasError = false;
            if (state.currentRepo) state.currentRepo.collaborators = action.payload;
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

        builder.addCase(editRegion.pending, (state: ReposState) => {
            state.isLoading = true;
            state.hasError = false;
        });
        builder.addCase(editRegion.fulfilled, (state: ReposState) => {
            state.isLoading = false;
            state.hasError = false;
        });
        builder.addCase(editRegion.rejected, (state: ReposState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(forkRoute.pending, (state: ReposState) => {
            state.isLoading = true;
            state.hasError = false;
        });
        builder.addCase(forkRoute.fulfilled, (state: ReposState) => {
            state.isLoading = false;
            state.hasError = false;
        });
        builder.addCase(forkRoute.rejected, (state: ReposState) => {
            state.isLoading = false;
            state.hasError = true;
        });
    },
});
export type { ReposState };
export const { toBeLoaded, handleError } = reposSlice.actions;
export default reposSlice.reducer;

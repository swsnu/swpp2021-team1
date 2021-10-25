import {
    createAsyncThunk,
    createSlice,
    PayloadAction,
    SliceCaseReducers
} from "@reduxjs/toolkit";
import {IDummyUser, IRepository, IUser} from "../../common/Interfaces";
import {getUserRepos, postRepo, putCollaborators} from "../../common/APIs";

export const getRepoList = createAsyncThunk<IRepository[], string>(
    'repos/list',
    async (username , thunkAPI) => {// payload creator
        const response = await getUserRepos(username);
        return response.data;
    }
)

export const addRepo = createAsyncThunk<IRepository, IRepository>(
    'repos/add',
    async (repo, thunkAPI) => {
        const response = await postRepo(repo);
        return response.data;
    }
)

export const changeCollaborators = createAsyncThunk<IRepository, {repoID : number, users : IDummyUser[]}>(
    'repos/collaborators',
    async ({repoID, users}, thunkAPI) => {
        const response = await putCollaborators(repoID, users);
        return response.data;
    }
)

interface ReposState {
    isLoading : boolean;
    hasError : boolean;
    currentRepo : IRepository|null;
    repoList : IRepository[];
}

export const reposInitialState: ReposState = {
    isLoading : true,
    hasError : false,
    currentRepo : null,
    repoList : [],
}

const reposSlice = createSlice<ReposState, SliceCaseReducers<ReposState>>({
    name: 'repos',
    initialState: reposInitialState,
    reducers: {
        toBeLoaded : state => {state.isLoading = true;},
        getRepo : (state : ReposState, action : PayloadAction<number>) => {
            console.log(action.payload);
            console.log(state.repoList);
            [state.currentRepo] = state.repoList.filter(value => value.repo_id === action.payload);
            if (!state.currentRepo) state.hasError = true;
        }
    },
    extraReducers: builder => {
        builder.addCase(getRepoList.pending, (state: ReposState) => {
            state.isLoading = true;
            state.hasError = false;
        })

        builder.addCase(getRepoList.fulfilled, (state: ReposState, action : PayloadAction<IRepository[]>) => {
            state.isLoading = false;
            state.hasError = false;
            state.repoList = action.payload;
        })

        builder.addCase(getRepoList.rejected, (state: ReposState) => {
            state.isLoading = false;
            state.hasError = true;
        })

        builder.addCase(addRepo.pending, (state: ReposState) => {
            state.isLoading = true;
            state.hasError = false;
        })

        builder.addCase(addRepo.fulfilled, (state: ReposState, action : PayloadAction<IRepository>) => {
            state.isLoading = false;
            state.hasError = false;
            state.currentRepo = action.payload;
        })

        builder.addCase(addRepo.rejected, (state: ReposState) => {
            state.isLoading = false;
            state.hasError = true;
        })

        builder.addCase(changeCollaborators.pending, (state : ReposState) => {
            state.isLoading = false;
            state.hasError = true;
        })

        builder.addCase(changeCollaborators.fulfilled, (state : ReposState, action : PayloadAction<IRepository>) => {
            state.isLoading = false;
            state.hasError = false;
            state.currentRepo = action.payload;
        })

        builder.addCase(changeCollaborators.rejected, (state : ReposState) => {
            state.isLoading = false;
            state.hasError = true;
        })
    }
})
export type { ReposState }
export const { toBeLoaded, getRepo } = reposSlice.actions
export default reposSlice.reducer
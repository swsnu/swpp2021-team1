import {
    createAsyncThunk, createSlice, PayloadAction, SliceCaseReducers,
} from "@reduxjs/toolkit";
import {
    IPlace, IRoute,
} from "../../common/Interfaces";
import {
    getPlacesQuery, getRegionQuery,
    getRoute,
    postPlaces, postRoute,
    putPlaces,
} from "../../common/APIs";

export const fetchRoute = createAsyncThunk<IRoute, number>( // added
    "route/fetch",
    async (repo_id, thunkAPI) => // payload creator
        await getRoute(repo_id),

);

export const addPlace = createAsyncThunk<IPlace[], {repo_id : number, place_id : number}>( // added
    "route/add",
    async ({ repo_id, place_id }, thunkAPI) => // payload creator
        await postPlaces(repo_id, place_id),

);

export const editPlaces = createAsyncThunk<IPlace[], {repo_id : number, places : IPlace[]}>( // added
    "route/edit/place",
    async ({ repo_id, places }, thunkAPI) => // payload creator
        await putPlaces(repo_id, places),

);

export const searchRegion = createAsyncThunk<PlaceQueryResult[], string>( // added
    "route/search/region",
    async (queryString, thunkAPI) => // payload creator
        await getRegionQuery(queryString),

);

export const searchPlace = createAsyncThunk<PlaceQueryResult[], string>( // added
    "route/search/place",
    async (queryString, thunkAPI) => // payload creator
        await getPlacesQuery(queryString),

);

export const editRegion = createAsyncThunk<void, {repo_id : number, place_id : number}>( // added
    "route/edit/region",
    async ({ repo_id, place_id }, thunkAPI) => // payload creator
        await postRoute(repo_id, place_id, "region"),

);

export const forkRoute = createAsyncThunk<void, {repo_id : number, forked_repo_id : number}>( // added
    "route/fork",
    async ({ repo_id, forked_repo_id }, thunkAPI) => // payload creator
        await postRoute(repo_id, forked_repo_id, "fork"),

);

export const routeInitialState: RouteState = {
    isLoading: true,
    isQueryLoading: false,
    hasError: false,
    hasConcurrentError: false,
    currentRoute: null,
    queryResult: [],
};

interface PlaceQueryResult {
    place_id : number,
    name? : string,
    formatted_address : string,
}

interface RouteState {
    isLoading : boolean;
    isQueryLoading : boolean;
    hasError : boolean;
    hasConcurrentError : boolean;
    currentRoute : IRoute|null;
    queryResult : PlaceQueryResult[];
}

const routeSlice = createSlice<RouteState, SliceCaseReducers<RouteState>>({
    name: "route",
    initialState: routeInitialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder.addCase(fetchRoute.pending, (state: RouteState) => {
            state.isLoading = true;
            state.hasError = false;
        });
        builder.addCase(fetchRoute.fulfilled, (state: RouteState, action: PayloadAction<IRoute>) => {
            state.isLoading = false;
            state.hasError = false;
            state.currentRoute = action.payload;
        });
        builder.addCase(fetchRoute.rejected, (state: RouteState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(addPlace.pending, (state: RouteState) => {
            state.isLoading = true;
            state.hasError = false;
        });
        builder.addCase(addPlace.fulfilled, (state: RouteState, action: PayloadAction<IPlace[]>) => {
            state.isLoading = false;
            state.hasError = false;
            if (state.currentRoute) state.currentRoute.places = action.payload;
        });
        builder.addCase(addPlace.rejected, (state: RouteState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(editPlaces.pending, (state: RouteState) => {
            state.isLoading = true;
            state.hasError = false;
        });
        builder.addCase(editPlaces.fulfilled, (state: RouteState, action: PayloadAction<IPlace[]>) => {
            state.isLoading = false;
            state.hasError = false;
            if (state.currentRoute) state.currentRoute.places = action.payload;
        });
        builder.addCase(editPlaces.rejected, (state: RouteState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(searchRegion.pending, (state: RouteState) => {
            state.isQueryLoading = true;
            state.hasError = false;
        });
        builder.addCase(searchRegion.fulfilled, (state: RouteState, action: PayloadAction<PlaceQueryResult[]>) => {
            state.isQueryLoading = false;
            state.hasError = false;
            state.queryResult = action.payload;
        });
        builder.addCase(searchRegion.rejected, (state: RouteState) => {
            state.isQueryLoading = false;
            state.hasError = true;
        });

        builder.addCase(searchPlace.pending, (state: RouteState) => {
            state.isQueryLoading = true;
            state.hasError = false;
        });
        builder.addCase(searchPlace.fulfilled, (state: RouteState, action: PayloadAction<PlaceQueryResult[]>) => {
            state.isQueryLoading = false;
            state.hasError = false;
            state.queryResult = action.payload;
        });
        builder.addCase(searchPlace.rejected, (state: RouteState) => {
            state.isQueryLoading = false;
            state.hasError = true;
        });

        builder.addCase(editRegion.pending, (state: RouteState) => {
            state.isLoading = true;
            state.hasError = false;
        });
        builder.addCase(editRegion.fulfilled, (state: RouteState) => {
            state.isLoading = false;
            state.hasError = false;
        });
        builder.addCase(editRegion.rejected, (state: RouteState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(forkRoute.pending, (state: RouteState) => {
            state.isLoading = true;
            state.hasError = false;
        });
        builder.addCase(forkRoute.fulfilled, (state: RouteState) => {
            state.isLoading = true;
            state.hasError = false;
        });
        builder.addCase(forkRoute.rejected, (state: RouteState) => {
            state.isLoading = false;
            state.hasError = true;
        });
    },
});

export type { RouteState, PlaceQueryResult };
export const { toBeLoaded, handleError, focusPhoto } = routeSlice.actions;
export default routeSlice.reducer;

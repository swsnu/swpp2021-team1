import {
    createAsyncThunk, createSlice, PayloadAction, SliceCaseReducers,
} from "@reduxjs/toolkit";
import {
    IPhoto,
    IPlace, IRoute,
} from "../../common/Interfaces";
import {
    getPlacesQuery, getRegionQuery,
    getRoute,
    postPlaces, putPhoto,
    putPlaces,
} from "../../common/APIs";

export const fetchRoute = createAsyncThunk<IRoute, number>( // added
    "route/fetch",
    async (repo_id) => // payload creator
        getRoute(repo_id),

);

export const addPlace = createAsyncThunk<
        {not_assigned: IPhoto[], places: IPlace[]},
        {repo_id : number, place_id : string}
    >( // added
        "route/add",
        async ({ repo_id, place_id }) => // payload creator
            postPlaces(repo_id, place_id),

    );

export const editPlaces = createAsyncThunk<
        {not_assigned: IPhoto[], places: IPlace[]},
        {repo_id : number, places : IPlace[]}
    >( // added
        "route/edit/place",
        async ({ repo_id, places }) => // payload creator
            putPlaces(repo_id, places),

    );

export const searchRegion = createAsyncThunk<PlaceQueryResult[], string>( // added
    "route/search/region",
    async (queryString) => // payload creator
        getRegionQuery(queryString),

);

export const searchPlace = createAsyncThunk<PlaceQueryResult[], {repo_id : number, queryString : string}>( // added
    "route/search/place",
    async ({ repo_id, queryString }) => // payload creator
        getPlacesQuery(repo_id, queryString),

);

export const editPhoto = createAsyncThunk<IPhoto, {repo_id : number, photo : IPhoto}>( // added
    "route/photo/edit",
    async ({ repo_id, photo }) => // payload creator
        putPhoto(repo_id, photo),

);

export const routeInitialState: RouteState = {
    isLoading: true,
    isQueryLoading: false,
    hasError: false,
    hasConcurrentError: false,
    currentRoute: null,
    queryResult: [],
    focusedPhoto: null,
};

interface PlaceQueryResult {
    place_id : string,
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
    focusedPhoto : IPhoto|null;
}

const routeSlice = createSlice<RouteState, SliceCaseReducers<RouteState>>({
    name: "route",
    initialState: routeInitialState,
    reducers: {
        focusPhoto: (state : RouteState, action: PayloadAction<number>) => {
            let photo: IPhoto | null = null;
            state.currentRoute?.places.forEach((value) =>
                value.photos.forEach((value1) => {
                    if (value1.photo_id === action.payload) photo = value1;
                }));
            state.focusedPhoto = photo;
        },
        clearResult: (state: RouteState) => {
            state.queryResult = [];
        },
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
        builder.addCase(addPlace.fulfilled,
            (state: RouteState, action: PayloadAction<{not_assigned: IPhoto[], places: IPlace[]}>) => {
                state.isLoading = false;
                state.hasError = false;
                if (state.currentRoute) {
                    state.currentRoute.not_assigned = action.payload.not_assigned;
                    state.currentRoute.places = action.payload.places;
                }
            });
        builder.addCase(addPlace.rejected, (state: RouteState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(editPlaces.pending, (state: RouteState) => {
            state.isLoading = true;
            state.hasError = false;
        });
        builder.addCase(editPlaces.fulfilled,
            (state: RouteState, action: PayloadAction<{not_assigned: IPhoto[], places: IPlace[]}>) => {
                state.isLoading = false;
                state.hasError = false;
                if (state.currentRoute) {
                    state.currentRoute.not_assigned = action.payload.not_assigned;
                    state.currentRoute.places = action.payload.places;
                }
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

        builder.addCase(editPhoto.pending, (state: RouteState) => {
            state.hasError = false;
        });
        builder.addCase(editPhoto.fulfilled, (state: RouteState, action: PayloadAction<IPhoto>) => {
            let index = -1;
            const place = state.currentRoute?.places.findIndex((value) =>
                (index = value.photos.findIndex((value1) => action.payload.photo_id === value1.photo_id)) !== -1);
            if (state.currentRoute && place !== undefined && place !== -1) {
                state.currentRoute.places[place].photos[index] = { ...action.payload };
            }
            state.hasError = false;
        });
        builder.addCase(editPhoto.rejected, (state: RouteState) => {
            state.hasError = true;
        });
    },
});

export type { RouteState, PlaceQueryResult };
export const { focusPhoto, clearResult } = routeSlice.actions;
export default routeSlice.reducer;

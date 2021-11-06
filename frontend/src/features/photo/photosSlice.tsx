import {
    createAsyncThunk, createSlice, PayloadAction, SliceCaseReducers,
} from "@reduxjs/toolkit";
import { IPhoto, IPost, IRepository } from "../../common/Interfaces";
import { fetchRepositories, reposInitialState, ReposState } from "../repository/reposSlice";
import {
    deletePhotos, getPhotos, getRepositories, postPhotos, putPhotos,
} from "../../common/APIs";

export const fetchPhotos = createAsyncThunk<IPhoto[], number>( // added
    "photos/list",
    async (repo_id, thunkAPI) => // payload creator
        await getPhotos(repo_id),

);

export const addPhotos = createAsyncThunk<IPhoto[], {repo_id : number, images : FormData}>( // added
    "photos/add",
    async ({ repo_id, images }, thunkAPI) => // payload creator
        await postPhotos(repo_id, images),

);

export const editPhotos = createAsyncThunk<IPhoto[], {repo_id : number, photos : IPhoto[]}>( // added
    "photos/edit",
    async ({ repo_id, photos }, thunkAPI) => // payload creator
        await putPhotos(repo_id, photos),

);

export const removePhotos = createAsyncThunk<IPhoto[], {repo_id : number, photos_id : number[]}>( // added
    "photos/remove",
    async ({ repo_id, photos_id }, thunkAPI) => // payload creator
        await deletePhotos(repo_id, photos_id),

);

export const photosInitialState: PhotosState = {
    isLoading: true,
    hasError: false,
    currentPhoto: null,
    photoList: [],
};

interface PhotosState {
    isLoading : boolean;
    hasError : boolean;
    currentPhoto : IPhoto|null;
    photoList : IPhoto[];
}

const photosSlice = createSlice<PhotosState, SliceCaseReducers<PhotosState>>({
    name: "photos",
    initialState: photosInitialState,
    reducers: {
        toBeLoaded: (state : PhotosState, action: PayloadAction<null>) => {
            state.isLoading = true;
        },
        handleError: (state : PhotosState, action: PayloadAction<null>) => {
            state.hasError = false;
        },
        focusPhoto: (state : PhotosState, action: PayloadAction<number>) => {
            const [photo] = state.photoList.filter((value) => value.photo_id === action.payload);
            state.currentPhoto = photo;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPhotos.pending, (state: PhotosState) => {
            state.isLoading = true;
            state.hasError = false;
        });
        builder.addCase(fetchPhotos.fulfilled, (state : PhotosState, action: PayloadAction<IPhoto[]>) => {
            state.isLoading = false;
            state.hasError = false;
            state.photoList = action.payload;
        });
        builder.addCase(fetchPhotos.rejected, (state: PhotosState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(addPhotos.pending, (state: PhotosState) => {
            state.isLoading = true;
            state.hasError = false;
        });
        builder.addCase(addPhotos.fulfilled, (state : PhotosState, action: PayloadAction<IPhoto[]>) => {
            state.isLoading = false;
            state.hasError = false;
            state.photoList = action.payload;
        });
        builder.addCase(addPhotos.rejected, (state: PhotosState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(editPhotos.pending, (state: PhotosState) => {
            state.isLoading = true;
            state.hasError = false;
        });
        builder.addCase(editPhotos.fulfilled, (state : PhotosState, action: PayloadAction<IPhoto[]>) => {
            state.isLoading = false;
            state.hasError = false;
            state.photoList = action.payload;
        });
        builder.addCase(editPhotos.rejected, (state: PhotosState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(removePhotos.pending, (state: PhotosState) => {
            state.isLoading = true;
            state.hasError = false;
        });
        builder.addCase(removePhotos.fulfilled, (state : PhotosState, action: PayloadAction<IPhoto[]>) => {
            state.isLoading = false;
            state.hasError = false;
            state.photoList = action.payload;
        });
        builder.addCase(removePhotos.rejected, (state: PhotosState) => {
            state.isLoading = false;
            state.hasError = true;
        });
    },
});

export type { PhotosState };
export const { toBeLoaded, handleError, focusPhoto } = photosSlice.actions;
export default photosSlice.reducer;

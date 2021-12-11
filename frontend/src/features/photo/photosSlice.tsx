import {
    createAsyncThunk, createSlice, PayloadAction, SliceCaseReducers,
} from "@reduxjs/toolkit";

import {
    deletePhotos, getPhotos, postPhotos, putLabelPhotos, putPhoto,
} from "../../common/APIs";
import { IPhoto } from "../../common/Interfaces";

export const fetchPhotos = createAsyncThunk<IPhoto[], number>( // added
    "photos/list",
    async (repo_id) => {
        if (repo_id === -1) return []; // PostCreate에서, 아무 repo도 선택하지 않았을 때에는 PostList를 []로 세팅함.
        return getPhotos(repo_id);
    },

);

export const addPhotos = createAsyncThunk<IPhoto[], {repo_id : number, images : FormData}>( // added
    "photos/add",
    async ({ repo_id, images }) => // payload creator
        postPhotos(repo_id, images),

);

export const editPhoto = createAsyncThunk<IPhoto, {repo_id : number, photo : IPhoto}>( // added
    "photos/edit",
    async ({ repo_id, photo }) => // payload creator
        putPhoto(repo_id, photo),

);

export const removePhotos = createAsyncThunk<IPhoto[], {repo_id : number, photos_id : {photo_id : number}[]}>( // added
    "photos/remove",
    async ({ repo_id, photos_id }) => // payload creator
        deletePhotos(repo_id, photos_id),

);

export const assignLabel = createAsyncThunk<IPhoto[], {
    repoId: number, labelId: number, photos: { photo_id: number }[]
}>(
    "photos/assignLabel",
    async ({ repoId, labelId, photos }) =>
        putLabelPhotos(repoId, labelId, photos),

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
        toBeLoaded: (state: PhotosState) => {
            state.isLoading = true;
        },
        handleError: (state: PhotosState) => {
            state.hasError = false;
        },
        focusPhoto: (state: PhotosState, action: PayloadAction<number>) => {
            const [photo] = state.photoList.filter((value) => value.photo_id === action.payload);
            state.currentPhoto = photo;
        },
        updateLocalTag: (state: PhotosState, action) => {
            const { photoId, content } = action.payload;
            const [photo] = state.photoList.filter((value) => value.photo_id === photoId);
            photo.local_tag = content;
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
            state.hasError = false;
        });
        builder.addCase(addPhotos.fulfilled, (state : PhotosState, action: PayloadAction<IPhoto[]>) => {
            state.hasError = false;
            state.photoList = action.payload;
        });
        builder.addCase(addPhotos.rejected, (state: PhotosState) => {
            state.hasError = true;
        });

        builder.addCase(editPhoto.pending, (state: PhotosState) => {
            state.hasError = false;
        });
        builder.addCase(editPhoto.fulfilled, (state : PhotosState, action: PayloadAction<IPhoto>) => {
            state.hasError = false;
            state.photoList = state.photoList.map((value) => {
                if (value.photo_id === action.payload.photo_id) return action.payload;
                return value;
            });
            state.currentPhoto = null;
        });
        builder.addCase(editPhoto.rejected, (state: PhotosState) => {
            state.hasError = true;
        });

        builder.addCase(removePhotos.pending, (state: PhotosState) => {
            state.hasError = false;
        });
        builder.addCase(removePhotos.fulfilled, (state : PhotosState, action: PayloadAction<IPhoto[]>) => {
            state.hasError = false;
            state.photoList = action.payload;
        });
        builder.addCase(removePhotos.rejected, (state: PhotosState) => {
            state.hasError = true;
        });
        builder.addCase(assignLabel.pending, (state: PhotosState) => {
            state.hasError = false;
        });
        builder.addCase(assignLabel.fulfilled, (state: PhotosState, action: PayloadAction<IPhoto[]>) => {
            state.hasError = false;
            action.payload.forEach((photo) => {
                const index = state.photoList.findIndex((p) => p.photo_id === photo.photo_id);
                state.photoList[index] = photo;
            });
        });
        builder.addCase(assignLabel.rejected, (state: PhotosState) => {
            state.hasError = true;
        });
    },
});

export type { PhotosState };
export const {
    toBeLoaded, handleError, focusPhoto, updateLocalTag,
} = photosSlice.actions;
export default photosSlice.reducer;

import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import {
    getLabels, postLabel, putLabel, deleteLabel, putLabelPhotos,
} from "../../common/APIs";
import { ILabel, IPhoto } from "../../common/Interfaces";

export const labelsAdapter = createEntityAdapter<ILabel>({
    selectId: (label: ILabel) => label.label_id,
    sortComparer: (a, b) => a.label_name.localeCompare(b.label_name),
});

export const loadLabels = createAsyncThunk<ILabel[], { repoId: number}>(
    "labels/load",
    async ({ repoId }) => {
        const labels = await getLabels(repoId);
        return labels;
    },
);

export const newLabel = createAsyncThunk<ILabel[], { repoId: number, labelName: string; }>(
    "labels/new",
    async ({ repoId, labelName }) => {
        const labels = await postLabel(repoId, { label_name: labelName });
        return labels;
    },
);

export const editLabel = createAsyncThunk<ILabel[], { repoId: number, labelId: number, newName: string; }>(
    "labels/edit",
    async ({ repoId, labelId, newName }) => {
        const labels = await putLabel(repoId, labelId, { label_name: newName });
        return labels;
    },
);
export const deleteOneLabel = createAsyncThunk<ILabel[], { repoId: number, labelId: number }>(
    "labels/delete",
    async ({ repoId, labelId }) => {
        const labels = await deleteLabel(repoId, labelId);
        return labels;
    },
);

export const labelsSlice = createSlice({
    name: "labels",
    initialState: labelsAdapter.getInitialState<{
        loading: "idle" | "pending" | "succeeded" | "failed",
    }>({ loading: "idle" }),
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(loadLabels.pending, (state, action) => {
            state.loading = "pending";
        });
        builder.addCase(loadLabels.fulfilled, (state, action) => {
            state.loading = "succeeded";
            labelsAdapter.setAll(state, action.payload);
        });
        builder.addCase(loadLabels.rejected, (state, action) => {
            state.loading = "failed";
        });
        builder.addCase(newLabel.fulfilled, (state, action) => {
            labelsAdapter.setAll(state, action.payload);
        });
        builder.addCase(editLabel.fulfilled, (state, action) => {
            labelsAdapter.setAll(state, action.payload);
        });
        builder.addCase(deleteOneLabel.fulfilled, (state, action) => {
            labelsAdapter.setAll(state, action.payload);
        });
    },
});

export default labelsSlice.reducer;
export const labelsSelectors = labelsAdapter.getSelectors<RootState>((state) => state.labels);

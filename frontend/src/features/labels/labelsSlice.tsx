import {
    createAsyncThunk,
    createEntityAdapter,
    createSlice,
    Dictionary,
    EntityId,
    SliceCaseReducers,
} from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import {
    deleteLabel, getLabels, postLabel, putLabel,
} from "../../common/APIs";
import { ILabel } from "../../common/Interfaces";

export const labelsAdapter = createEntityAdapter<ILabel>({
    selectId: (label: ILabel) => label.label_id,
    sortComparer: (a, b) => a.label_name.localeCompare(b.label_name),
});

export const loadLabels = createAsyncThunk<ILabel[], { repoId: number }>(
    "labels/load",
    async ({ repoId }) => {
        if (repoId < 0) return [];
        return getLabels(repoId);
    },
);

export const newLabel = createAsyncThunk<ILabel[], { repoId: number, labelName: string; }>(
    "labels/new",
    async ({ repoId, labelName }) =>
        postLabel(repoId, { label_name: labelName }),
);

export const editLabel = createAsyncThunk<ILabel[], { repoId: number, labelId: number, newName: string; }>(
    "labels/edit",
    async ({ repoId, labelId, newName }) =>
        putLabel(repoId, labelId, { label_name: newName }),
);
export const deleteOneLabel = createAsyncThunk<ILabel[], { repoId: number, labelId: number }>(
    "labels/delete",
    async ({ repoId, labelId }) => deleteLabel(repoId, labelId),
);

interface LabelsState {
    loading: "idle" | "pending" | "succeeded" | "failed",
    ids: EntityId[],
    entities: Dictionary<ILabel>
}

export const labelsSlice = createSlice<LabelsState, SliceCaseReducers<LabelsState>>({
    name: "labels",
    initialState: labelsAdapter.getInitialState<{
        loading: "idle" | "pending" | "succeeded" | "failed",
    }>({ loading: "idle" }),
    reducers: {
        setLabelsIdle(state) {
            state.loading = "idle";
        },
    },
    extraReducers: (builder) => {
        builder.addCase(loadLabels.pending, (state) => {
            state.loading = "pending";
        });
        builder.addCase(loadLabels.fulfilled, (state, action) => {
            state.loading = "succeeded";
            labelsAdapter.setAll(state, action.payload);
        });
        builder.addCase(loadLabels.rejected, (state) => {
            state.loading = "failed";
        });
        builder.addCase(newLabel.fulfilled, (state, action) => {
            labelsAdapter.setAll(state, action.payload);
        });
        builder.addCase(newLabel.rejected, (state) => {
            state.loading = "failed";
        });
        builder.addCase(editLabel.fulfilled, (state, action) => {
            labelsAdapter.setAll(state, action.payload);
        });
        builder.addCase(deleteOneLabel.fulfilled, (state, action) => {
            labelsAdapter.setAll(state, action.payload);
        });
    },
});

export const { setLabelsIdle } = labelsSlice.actions;

export default labelsSlice.reducer;
export const labelsSelectors = labelsAdapter.getSelectors<RootState>((state) => state.labels);

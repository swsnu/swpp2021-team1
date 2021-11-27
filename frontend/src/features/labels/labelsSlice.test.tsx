import { configureStore } from "@reduxjs/toolkit";
import thunk from "redux-thunk";

import { getLabelsHE, postLabelHE } from "../../mocks/handlers";
import server from "../../mocks/server";
import labelsReducer, {
    deleteOneLabel, editLabel, loadLabels, newLabel, setLabelsIdle,
} from "./labelsSlice";

describe("labelsSlice", () => {
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers);
    afterAll(() => server.close());
    let store;
    it("should handle loadLabels", async () => {
        store = configureStore({
            reducer: labelsReducer,
        });
        await store.dispatch(loadLabels({ repoId: 1 }));
    });
    it("should handle loadLabels rejected", async () => {
        server.use(getLabelsHE);
        store = configureStore({
            reducer: labelsReducer,
        });
        await store.dispatch(loadLabels({ repoId: 1 }));
    });
    it("should handle newLabel", async () => {
        store = configureStore({
            reducer: labelsReducer,
        });
        await store.dispatch(newLabel({ repoId: 1, labelName: "" }));
    });
    it("should handle newLabel rejected", async () => {
        server.use(postLabelHE);
        store = configureStore({
            reducer: labelsReducer,
        });
        await store.dispatch(newLabel({ repoId: 1, labelName: "" }));
    });
    it("should handle editLabel", async () => {
        store = configureStore({
            reducer: labelsReducer,
        });
        await store.dispatch(editLabel({ repoId: 1, labelId: 1, newName: "" }));
    });
    it("should handle deleteOneLabel", async () => {
        store = configureStore({
            reducer: labelsReducer,
        });
        await store.dispatch(deleteOneLabel({ repoId: 1, labelId: 1 }));
    });
    it("should handle setLabelsIdle", async () => {
        store = configureStore({ reducer: labelsReducer });
        await store.dispatch(setLabelsIdle(""));
    });
});

import { configureStore } from "@reduxjs/toolkit";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import labelsReducer, {
    deleteOneLabel,
    editLabel, labelsAdapter, loadLabels, newLabel,
} from "./labelsSlice";
import server from "../../mocks/server";
import { getLabelsHE } from "../../mocks/handlers";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

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
});

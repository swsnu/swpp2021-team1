import { configureStore } from "@reduxjs/toolkit";
import * as APIs from "../../../common/APIs";
import {
    repositorySearchFactory,
    userFactory,
} from "../../../common/Interfaces";
import searchReducer, {
    saveSearchInfo, searchRegion, searchRepository, searchUser,
} from "./searchSlice";

jest.mock("../../../common/APIs");
const mockedAPIs = APIs as jest.Mocked<typeof APIs>;

describe("searchSlice", () => {
    let store = configureStore({
        reducer: {
            search: searchReducer,
        },
    });

    beforeEach(() => {
        store = configureStore({
            reducer: {
                search: searchReducer,
            },
        });
    });

    it("Should search user correctly", async () => {
        const user = userFactory();
        mockedAPIs.getUserSearch.mockResolvedValue([user]);
        await store.dispatch(searchUser(""));
        expect(store.getState().search.userResult).toEqual([user]);
        expect(store.getState().search.repositoryResult).toEqual([]);
    });

    it("Should search repository correctly", async () => {
        const repository = repositorySearchFactory();
        mockedAPIs.getRepositorySearch.mockResolvedValue([repository]);
        await store.dispatch(searchRepository(""));
        expect(store.getState().search.repositoryResult).toEqual([repository]);
        expect(store.getState().search.userResult).toEqual([]);
    });

    it("Should search region correctly", async () => {
        const repository = repositorySearchFactory();
        mockedAPIs.getRegionSearch.mockResolvedValue([repository]);
        await store.dispatch(searchRegion(""));
        expect(store.getState().search.repositoryResult).toEqual([repository]);
        expect(store.getState().search.userResult).toEqual([]);
    });

    it("Should be able to save recent query", () => {
        store.dispatch(saveSearchInfo("test"));
        expect(store.getState().search.searchInfo).toEqual("test");
    });
});

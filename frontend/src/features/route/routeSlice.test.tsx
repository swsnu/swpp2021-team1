import { configureStore } from "@reduxjs/toolkit";
import * as APIs from "../../common/APIs";
import {
    photoFactory,
    placeFactory, placeQueryFactory,
    routeFactory,
} from "../../common/Interfaces";
import routeReducer, {
    addPlace, clearResult, editPhoto, editPlaces, fetchRoute, focusPhoto, searchPlace, searchRegion,
} from "./routeSlice";

jest.mock("../../common/APIs");
const mockedAPIs = APIs as jest.Mocked<typeof APIs>;

describe("reposSlice", () => {
    let store = configureStore({
        reducer: {
            route: routeReducer,
        },
    });

    beforeEach(() => {
        store = configureStore({
            reducer: {
                route: routeReducer,
            },
        });
    });

    it("Should fetch route correctly", () => {
        const route = routeFactory();
        mockedAPIs.getRoute.mockResolvedValue(route);
        store.dispatch(fetchRoute(-1)).then(() => {
            expect(store.getState().route.currentRoute).toEqual(route);
        });
        mockedAPIs.getRoute.mockRejectedValue(undefined);
        store.dispatch(fetchRoute(-1)).then(() => {
            expect(store.getState().route.hasError).toEqual(true);
        });
    });

    it("Should be able to add place", async () => {
        const place = placeFactory();
        const photo = photoFactory();
        mockedAPIs.postPlaces.mockResolvedValue({ not_assigned: [photo], places: [place] });
        await store.dispatch(addPlace({ repo_id: -1, place_id: "-1" }));
        expect(store.getState().route.isLoading).toBe(false);
        const route = routeFactory();
        mockedAPIs.getRoute.mockResolvedValue(route);
        await store.dispatch(fetchRoute(-1));
        await store.dispatch(addPlace({ repo_id: -1, place_id: "-1" }));
        expect(store.getState().route.currentRoute?.not_assigned).toEqual([photo]);
        mockedAPIs.postPlaces.mockRejectedValue(undefined);
        await store.dispatch(addPlace({ repo_id: -1, place_id: "-1" }));
        expect(store.getState().route.hasError).toBe(true);
    });

    it("Should be able to edit place", async () => {
        const place = placeFactory();
        const photo = photoFactory();
        mockedAPIs.putPlaces.mockResolvedValue({ not_assigned: [photo], places: [place] });
        await store.dispatch(editPlaces({ repo_id: -1, places: [place] }));
        expect(store.getState().route.isLoading).toBe(false);
        const route = routeFactory();
        mockedAPIs.getRoute.mockResolvedValue(route);
        await store.dispatch(fetchRoute(-1));
        await store.dispatch(editPlaces({ repo_id: -1, places: [place] }));
        expect(store.getState().route.currentRoute?.not_assigned).toEqual([photo]);
        mockedAPIs.putPlaces.mockRejectedValue(undefined);
        await store.dispatch(editPlaces({ repo_id: -1, places: [place] }));
        expect(store.getState().route.hasError).toBe(true);
    });

    it("Should be able to search region", async () => {
        const pqr = placeQueryFactory();
        mockedAPIs.getRegionQuery.mockResolvedValue([pqr]);
        await store.dispatch(searchRegion("query"));
        expect(store.getState().route.queryResult).toEqual([pqr]);
        mockedAPIs.getRegionQuery.mockRejectedValue(undefined);
        await store.dispatch(searchRegion("query"));
        expect(store.getState().route.hasError).toBe(true);
    });

    it("Should be able to search place + clear result", async () => {
        const pqr = placeQueryFactory();
        mockedAPIs.getPlacesQuery.mockResolvedValue([pqr]);
        await store.dispatch(searchPlace({ repo_id: -1, queryString: "query" }));
        expect(store.getState().route.queryResult).toEqual([pqr]);
        mockedAPIs.getPlacesQuery.mockRejectedValue(undefined);
        await store.dispatch(searchPlace({ repo_id: -1, queryString: "query" }));
        expect(store.getState().route.hasError).toBe(true);
        await store.dispatch(clearResult(null));
        expect(store.getState().route.queryResult).toEqual([]);
    });

    it("Should be able to edit photo + focus photo", async () => {
        const place = placeFactory();
        const photo = photoFactory();
        mockedAPIs.putPhoto.mockResolvedValue(photo);
        await store.dispatch(editPhoto({ repo_id: -1, photo }));
        expect(store.getState().route.hasError).toBe(false);
        const route = routeFactory();
        mockedAPIs.getRoute.mockResolvedValue({ ...route, places: [{ ...place, photos: [photo] }] });
        await store.dispatch(fetchRoute(-1));
        await store.dispatch(editPhoto({ repo_id: -1, photo }));
        expect(store.getState().route.currentRoute?.places[0].photos).toEqual([photo]);
        mockedAPIs.putPhoto.mockRejectedValue(undefined);
        await store.dispatch(editPhoto({ repo_id: -1, photo }));
        expect(store.getState().route.hasError).toBe(true);
        await store.dispatch(focusPhoto(photo.photo_id));
        expect(store.getState().route.focusedPhoto).toEqual(photo);
    });
});

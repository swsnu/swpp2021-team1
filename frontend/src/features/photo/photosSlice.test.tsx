import { configureStore } from "@reduxjs/toolkit";
import * as APIs from "../../common/APIs";
import {
    IPhoto, IRepository, photoFactory, repositoryFactory,
} from "../../common/Interfaces";
import photosReducer, {
    addPhotos, editPhotos, fetchPhotos,
    focusPhoto, handleError, removePhotos, toBeLoaded,
} from "./photosSlice";

jest.mock("../../common/APIs");
const mockedAPIs = APIs as jest.Mocked<typeof APIs>;

describe("photosSlice", () => {
    let store = configureStore({
        reducer: {
            photos: photosReducer,
        },
    });

    beforeEach(() => {
        store = configureStore({
            reducer: {
                photos: photosReducer,
            },
        });
    });

    it("Should fetch photos correctly", () => {
        const photo : IPhoto = photoFactory();
        mockedAPIs.getPhotos.mockResolvedValue([photo]);
        store.dispatch(fetchPhotos(1)).then(() => {
            expect(store.getState().photos.photoList.length).toBe(1);
        });
        mockedAPIs.getPhotos.mockRejectedValue(undefined);
        store.dispatch(fetchPhotos(1)).then(() => {
            expect(store.getState().photos.hasError).toEqual(true);
        });
    });

    it("Should edit photos correctly", () => {
        const photo : IPhoto = photoFactory();
        mockedAPIs.putPhotos.mockResolvedValue([photo]);
        store.dispatch(editPhotos({ repo_id: 1, photos: [photo] })).then(() => {
            expect(store.getState().photos.photoList.length).toBe(1);
        });
        mockedAPIs.putPhotos.mockRejectedValue(undefined);
        store.dispatch(editPhotos({ repo_id: 1, photos: [photo] })).then(() => {
            expect(store.getState().photos.hasError).toEqual(true);
        });
    });

    it("Should add photos correctly", () => {
        const photo : IPhoto = photoFactory();
        mockedAPIs.postPhotos.mockResolvedValue([photo]);
        store.dispatch(addPhotos({ repo_id: 1, images: new FormData() })).then(() => {
            expect(store.getState().photos.photoList.length).toBe(1);
        });
        mockedAPIs.postPhotos.mockRejectedValue(undefined);
        store.dispatch(addPhotos({ repo_id: 1, images: new FormData() })).then(() => {
            expect(store.getState().photos.hasError).toEqual(true);
        });
    });

    it("Should remove photos correctly + handleError + toBeLoaded + focusPhoto", () => {
        const photo : IPhoto = photoFactory();
        mockedAPIs.deletePhotos.mockResolvedValue([photo]);
        store.dispatch(removePhotos({ repo_id: 1, photos_id: [{ photo_id: 1 }] })).then(() => {
            expect(store.getState().photos.photoList.length).toEqual(1);
            store.dispatch(focusPhoto(photo.photo_id));
            expect(store.getState().photos.currentPhoto).toEqual(photo);
        });
        mockedAPIs.deletePhotos.mockRejectedValue(undefined);
        store.dispatch(removePhotos({ repo_id: 1, photos_id: [{ photo_id: 1 }] })).then(() => {
            expect(store.getState().photos.hasError).toEqual(true);
        });
        store.dispatch(handleError(null));
        expect(store.getState().photos.hasError).toEqual(false);
        // to be loaded
        store.dispatch(toBeLoaded(null));
        expect(store.getState().photos.isLoading).toEqual(true);
    });
});

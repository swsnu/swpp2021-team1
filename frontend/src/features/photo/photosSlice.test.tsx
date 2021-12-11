import { configureStore } from "@reduxjs/toolkit";
import * as APIs from "../../common/APIs";
import {
    IPhoto, photoFactory,
} from "../../common/Interfaces";
import photosReducer, {
    addPhotos, assignLabel, editPhoto, fetchPhotos,
    focusPhoto, handleError, photosInitialState, removePhotos, toBeLoaded,
    updateLocalTag,
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

    it("Should edit photos correctly", async () => {
        const photo : IPhoto = photoFactory();
        const photo2 : IPhoto = photoFactory();
        mockedAPIs.getPhotos.mockResolvedValue([photo, photo2]);
        await store.dispatch(fetchPhotos(1));
        mockedAPIs.putPhoto.mockResolvedValue({ ...photo, image: "TEST" });
        await store.dispatch(editPhoto({ repo_id: 1, photo }));
        expect(store.getState().photos.photoList[0].image).toBe("TEST");
        mockedAPIs.putPhoto.mockRejectedValue(undefined);
        await store.dispatch(editPhoto({ repo_id: 1, photo }));
        expect(store.getState().photos.hasError).toEqual(true);
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
    it("should assign labels to photos correctly", async () => {
        const photo: IPhoto = photoFactory();
        mockedAPIs.postPhotos.mockResolvedValue([photo]);
        await store.dispatch(addPhotos({ repo_id: 1, images: new FormData() }));
        mockedAPIs.putLabelPhotos.mockResolvedValue([photo]);
        await store.dispatch(assignLabel({
            repoId: 1,
            labelId: 1,
            photos: [],
        }));
    });
    it("should handle assignLabel reject", async () => {
        mockedAPIs.putLabelPhotos.mockRejectedValue("");
        await store.dispatch(assignLabel({
            repoId: 1,
            labelId: 1,
            photos: [],
        }));
    });
    it("should handle updateLocalTag", () => {
        const photo = photoFactory();
        const action = { type: updateLocalTag.type, payload: { photoId: photo.photo_id, content: "abc" } };
        const state = photosReducer({
            ...photosInitialState,
            photoList: [photo],
        }, action);
        expect(state.photoList[0].local_tag).toBe("abc");
    });
    it("should not fetch anything when repo_id is -1", async () => {
        const store = configureStore({
            reducer: {
                photos: photosReducer,
            },
        });
        await store.dispatch(fetchPhotos(-1));
        expect(store.getState().photos.photoList.length).toBe(0);
    });
});

import { configureStore } from "@reduxjs/toolkit";
import * as APIs from "../../common/APIs";
import {
    IRepository, IUser, repositoryFactory, userFactory,
} from "../../common/Interfaces";
import reposReducer, {
    addCollaborators,
    createRepository, editRepository,
    fetchRepositories, fetchRepository, handleError, removeRepository,
    leaveRepository,
    toBeLoaded, editRegion, forkRoute,
} from "./reposSlice";

jest.mock("../../common/APIs");
const mockedAPIs = APIs as jest.Mocked<typeof APIs>;

describe("reposSlice", () => {
    let store = configureStore({
        reducer: {
            repos: reposReducer,
        },
    });

    beforeEach(() => {
        store = configureStore({
            reducer: {
                repos: reposReducer,
            },
        });
    });

    it("Should fetch repositories correctly", () => {
        const repository : IRepository = repositoryFactory();
        mockedAPIs.getRepositories.mockResolvedValue([repository]);
        store.dispatch(fetchRepositories("")).then(() => {
            expect(store.getState().repos.repoList.length).toBe(1);
        });
        mockedAPIs.getRepositories.mockRejectedValue(undefined);
        store.dispatch(fetchRepositories("")).then(() => {
            expect(store.getState().repos.hasError).toEqual(true);
        });
    });

    it("Should create repository correctly", () => {
        const repository : IRepository = repositoryFactory();
        mockedAPIs.postRepositories.mockResolvedValue(repository);
        store.dispatch(createRepository(repository)).then(() => {
            expect(store.getState().repos.currentRepo).toEqual(repository);
        });
        mockedAPIs.postRepositories.mockRejectedValue(undefined);
        store.dispatch(createRepository(repository)).then(() => {
            expect(store.getState().repos.hasError).toEqual(true);
        });
    });

    it("Should edit repository correctly", () => {
        const repository : IRepository = repositoryFactory();
        mockedAPIs.putRepository.mockResolvedValue(repository);
        store.dispatch(editRepository(repository)).then(() => {
            expect(store.getState().repos.currentRepo).toEqual(repository);
        });
        mockedAPIs.putRepository.mockRejectedValue(undefined);
        store.dispatch(editRepository(repository)).then(() => {
            expect(store.getState().repos.hasError).toEqual(true);
        });
    });

    it("Should remove repository correctly", () => {
        mockedAPIs.deleteRepository.mockResolvedValue();
        store.dispatch(removeRepository(1)).then(() => {
            expect(store.getState().repos.isLoading).toEqual(false);
        });
        mockedAPIs.deleteRepository.mockRejectedValue(undefined);
        store.dispatch(removeRepository(1)).then(() => {
            expect(store.getState().repos.hasError).toEqual(true);
        });
    });

    it("Should fetch repository correctly", () => {
        const repository : IRepository = repositoryFactory();
        mockedAPIs.getRepository.mockResolvedValue(repository);
        store.dispatch(fetchRepository(1)).then(() => {
            expect(store.getState().repos.currentRepo).toEqual(repository);
        });
        mockedAPIs.getRepository.mockRejectedValue(undefined);
        store.dispatch(fetchRepository(1)).then(() => {
            expect(store.getState().repos.hasError).toEqual(true);
        });
    });

    it("Should add collaborator correctly", async () => {
        const user : IUser = userFactory();
        const repository : IRepository = repositoryFactory();
        mockedAPIs.postCollaborators.mockResolvedValue([user]);
        await store.dispatch(addCollaborators({ repoID: 1, users: [] }));
        expect(store.getState().repos.isLoading).toEqual(false);
        mockedAPIs.getRepository.mockResolvedValue(repository);
        await store.dispatch(fetchRepository(1));
        await store.dispatch(addCollaborators({ repoID: 1, users: [] }));
        expect(store.getState().repos.currentRepo?.collaborators).toEqual([user]);
        mockedAPIs.postCollaborators.mockRejectedValue(undefined);
        await store.dispatch(addCollaborators({ repoID: 1, users: [] }));
        expect(store.getState().repos.hasError).toEqual(true);
    });

    it("Should secede from repo correctly + handle error + to be loaded", () => {
        mockedAPIs.deleteCollaborators.mockResolvedValue();
        store.dispatch(leaveRepository({ repoID: 1, username: "a" })).then(() => {
            expect(store.getState().repos.isLoading).toEqual(false);
        });
        mockedAPIs.deleteCollaborators.mockRejectedValue(undefined);
        store.dispatch(leaveRepository({ repoID: 1, username: "a" })).then(() => {
            expect(store.getState().repos.hasError).toEqual(true);
        });
        // handle error
        store.dispatch(handleError(null));
        expect(store.getState().repos.hasError).toEqual(false);
        // to be loaded
        store.dispatch(toBeLoaded(null));
        expect(store.getState().repos.isLoading).toEqual(true);
    });

    it("Should able to edit region", () => {
        mockedAPIs.postRoute.mockResolvedValue();
        store.dispatch(editRegion({ repo_id: 1, place_id: "1" })).then(() => {
            expect(store.getState().repos.isLoading).toEqual(false);
        });
        mockedAPIs.postRoute.mockRejectedValue(undefined);
        store.dispatch(editRegion({ repo_id: 1, place_id: "a" })).then(() => {
            expect(store.getState().repos.hasError).toEqual(true);
        });
    });

    it("Should able to fork repo", () => {
        mockedAPIs.postRoute.mockResolvedValue();
        store.dispatch(forkRoute({ repo_id: 1, forked_repo_id: 1 })).then(() => {
            expect(store.getState().repos.isLoading).toEqual(false);
        });
        mockedAPIs.postRoute.mockRejectedValue(undefined);
        store.dispatch(forkRoute({ repo_id: 1, forked_repo_id: 1 })).then(() => {
            expect(store.getState().repos.hasError).toEqual(true);
        });
    });
});

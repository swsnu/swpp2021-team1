import { configureStore } from "@reduxjs/toolkit";
import * as APIs from "../../common/APIs";
import { IRepository, repositoryFactory } from "../../common/Interfaces";
import reposReducer, {
    addCollaborators,
    createRepository, editRepository,
    fetchRepositories, fetchRepository, handleError, removeRepository,
    reposInitialState, secedeRepository,
    toBeLoaded,
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

    it("Should change error state correctly", () => {
        store.dispatch(toBeLoaded(null));
        expect(store.getState().repos.isLoading).toEqual(false);
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
        const repository : IRepository = repositoryFactory();
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

    it("Should add collaborator correctly", () => {
        const repository : IRepository = repositoryFactory();
        mockedAPIs.postCollaborators.mockResolvedValue();
        store.dispatch(addCollaborators({ repoID: 1, users: [] })).then(() => {
            expect(store.getState().repos.isLoading).toEqual(false);
        });
        mockedAPIs.postCollaborators.mockRejectedValue(undefined);
        store.dispatch(addCollaborators({ repoID: 1, users: [] })).then(() => {
            expect(store.getState().repos.hasError).toEqual(true);
        });
    });

    it("Should secede from repo correctly + handling error", () => {
        const repository : IRepository = repositoryFactory();
        mockedAPIs.deleteCollaborators.mockResolvedValue();
        store.dispatch(secedeRepository({ repoID: 1, username: "a" })).then(() => {
            expect(store.getState().repos.isLoading).toEqual(false);
        });
        mockedAPIs.deleteCollaborators.mockRejectedValue(undefined);
        store.dispatch(secedeRepository({ repoID: 1, username: "a" })).then(() => {
            expect(store.getState().repos.hasError).toEqual(true);
        });
        // handling error
        store.dispatch(handleError(null));
        expect(store.getState().repos.hasError).toEqual(false);
    });
});

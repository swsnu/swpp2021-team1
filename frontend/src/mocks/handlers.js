// src/mocks/handlers.js
import faker from "faker";
import { rest } from "msw";
import Factory from "./dataGenerator";

const fact = new Factory();

export default [
    // rest.get("/api/session/", (req, res, ctx) => {
    //     const user = fact.userGen();
    //     return res(ctx.json({
    //         username: user.username,
    //         bio: user.bio,
    //         profile_picture: user.profile_picture,
    //         visibility: user.visibility,
    //         real_name: user.real_name,
    //         email: user.email,
    //     }));
    // }),
    rest.post("/api/signin/", (req, res, ctx) => {
        const user = fact.userGen();
        return res(
            ctx.status(201), ctx.json({
                username: user.username,
                bio: user.bio,
                profile_picture: user.profile_picture,
                visibility: user.visibility,
                real_name: user.real_name,
                email: user.email,
            }),
        );
    }),

    rest.get("/api/signout/", (req, res, ctx) => res(
        ctx.status(200),
    )),

    rest.post("/api/users/", (req, res, ctx) => {
        const user = fact.userGen();
        return res(
            ctx.json({
                username: user.username,
                bio: user.bio,
                profile_picture: user.profile_picture,
                visibility: user.visibility,
                real_name: user.real_name,
                email: user.email,
            }),
        );
    }),

    rest.delete("/api/users/:username/", (req, res, ctx) => res(ctx.status(200))),
    rest.put("/api/users/:username/", (req, res, ctx) => {
        const fakeUser = fact.userGen();
        return res(
            ctx.json({
                username: fakeUser.username,
                bio: fakeUser.bio,
                profile_picture: fakeUser.profile_picture,
                visibility: fakeUser.visibility,
                real_name: fakeUser.real_name,
                email: fakeUser.email,
            }),
        );
    }),
    rest.get("/api/users/:username", (req, res, ctx) => {
        const fakeUser = fact.userGen();
        const friends = [];
        const n = faker.datatype.number({ min: 1, max: 10 });
        for (let i = 0; i < n; i += 1) {
            friends.push(fact.userGen());
        }
        return res(ctx.json({
            username: fakeUser.username,
            bio: fakeUser.bio,
            profile_picture: fakeUser.profile_picture,
            visibility: fakeUser.visibility,
            real_name: fakeUser.real_name,
            email: fakeUser.email,
            friends: fakeUser.friends,
        }));
    }),

    rest.get("/api/users/:username/friends/", (req, res, ctx) => {
        const friends = [];
        const n = faker.datatype.number({ min: 1, max: 10 });
        for (let i = 0; i < n; i += 1) {
            const {
                real_name, username, profile_picture, bio,
            } = fact.userGen();
            friends.push({
                real_name, username, profile_picture, bio,
            });
        }
        return res(ctx.json(friends));
    }),

    rest.post("/api/users/:username/friends/:fusername/", (req, res, ctx) => {
        const friends = [];
        const n = faker.datatype.number({ min: 1, max: 10 });
        for (let i = 0; i < n; i += 1) {
            const { username, profile_picture, bio } = fact.userGen();
            friends.push({
                username, profile_picture, bio,
            });
        }
        return res(ctx.json(friends));
    }),
    rest.delete("/api/users/:username/friends/:fusername/", (req, res, ctx) => {
        const friends = [];
        const n = faker.datatype.number({ min: 1, max: 10 });
        for (let i = 0; i < n; i += 1) {
            const { username, profile_picture, bio } = fact.userGen();
            friends.push({
                username, profile_picture, bio,
            });
        }
        return res(ctx.json(friends));
    }),

    rest.post("/api/repositories/", (req, res, ctx) => {
        const {
            repo_id, repo_name, owner, travel_start_date, travel_end_date, visibility, collaborators,
        } = fact.repoGen();
        return res(ctx.json({
            repo_id, repo_name, owner, travel_start_date, travel_end_date, visibility, collaborators,
        }));
    }),
    rest.get("/api/repositories/", (req, res, ctx) => {
        const n = faker.datatype.number({ min: 1, max: 3 });
        const repos = [];
        for (let i = 0; i < n; i += 1) {
            const {
                repo_id, repo_name, owner, travel_start_date, travel_end_date, visibility, collaborators,
            } = fact.repoGen();
            repos.push({
                repo_id, repo_name, owner, travel_start_date, travel_end_date, visibility, collaborators,
            });
        }
        return res(ctx.json(repos));
    }),

    rest.get("/api/repositories/:repo_id/", (req, res, ctx) => {
        const {
            repo_id, repo_name, owner, travel_start_date, travel_end_date, visibility, collaborators,
        } = fact.repoGen();
        return res(ctx.json({
            repo_id, repo_name, owner, travel_start_date, travel_end_date, visibility, collaborators,
        }));
    }),
    rest.delete("/api/repositories/:repo_id/", (req, res, ctx) => res(ctx.status(200))),
    rest.put("/api/repositories/:repo_id/", (req, res, ctx) => {
        const {
            repo_id, repo_name, owner, travel_start_date, travel_end_date, visibility, collaborators,
        } = fact.repoGen();
        return res(ctx.json({
            repo_id, repo_name, owner, travel_start_date, travel_end_date, visibility, collaborators,
        }));
    }),

    rest.get("/api/repositories/:repo_id/collaborators/", (req, res, ctx) => {
        const collaborators = [];
        const n = faker.datatype.number({ min: 1, max: 5 });
        for (let i = 0; i < n; i += 1) {
            const { username, profile_picture, bio } = fact.userGen();
            collaborators.push({ username, profile_picture, bio });
        }
        return res(ctx.json(collaborators));
    }),
    rest.post("/api/repositories/:repo_id/collaborators/", (req, res, ctx) => {
        const collaborators = [];
        const n = faker.datatype.number({ min: 1, max: 5 });
        for (let i = 0; i < n; i += 1) {
            const { username, profile_picture, bio } = fact.userGen();
            collaborators.push({ username, profile_picture, bio });
        }
        return res(ctx.json(collaborators));
    }),

    rest.delete("/api/repositories/:repo_id/collaborators/:username", (req, res, ctx) => {
        const friends = [];
        const n = faker.datatype.number({ min: 1, max: 10 });
        for (let i = 0; i < n; i += 1) {
            const { username, profile_picture, bio } = fact.userGen();
            friends.push({
                username, profile_picture, bio,
            });
        }
        return res(ctx.json(friends));
    }),
];

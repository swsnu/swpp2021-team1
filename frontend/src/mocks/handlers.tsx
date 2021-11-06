// src/mocks/handlers.js
import faker from "faker";
import { rest } from "msw";
// import {
//     IUser, IRepository, IPost, IPhoto, IDiscussion, IComment, ILabel, IPlace,
// } from "../common/Interfaces";
import Factory from "./dataGenerator";

const fact = new Factory();

export default [
    rest.post("/signin/", (req, res, ctx) => {
        const user = fact.userGen();
        res(ctx.json({
            username: user.username,
            bio: user.bio,
            profile_picture: user.profile_picture,
            visibility: user.visibility,
            real_name: user.real_name,
            email: user.email,
        }));
    }),

    rest.get("/signout/", (req, res, ctx) => res(
        ctx.status(200),
    )),

    rest.post("/users/", (req, res, ctx) => {
        const user = fact.userGen();
        res(
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

    rest.delete("/users/:username/", (req, res, ctx) => res(ctx.status(200))),
    rest.put("/users/:username/", (req, res, ctx) => {
        const fakeUser = fact.userGen();
        res(
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
    rest.get("/users/:username", (req, res, ctx) => {
        const fakeUser = fact.userGen();
        const friends = [];
        const n = faker.datatype.number({ min: 1, max: 10 });
        for (let i = 0; i < n; i += 1) {
            friends.push(fact.userGen());
        }
        res(ctx.json({
            username: fakeUser.username,
            bio: fakeUser.bio,
            profile_picture: fakeUser.profile_picture,
            visibility: fakeUser.visibility,
            real_name: fakeUser.real_name,
            email: fakeUser.email,
            friends: fakeUser.friends,
        }));
    }),

    rest.get("/users/:username/friends/", (req, res, ctx) => {
        const friends = [];
        const n = faker.datatype.number({ min: 1, max: 10 });
        for (let i = 0; i < n; i += 1) {
            const { username, profile_picture, bio } = fact.userGen();
            friends.push({
                username, profile_picture, bio,
            });
        }
        res(ctx.json(friends));
    }),

    rest.post("/users/:username/friends/:fusername/", (req, res, ctx) => {
        const friends = [];
        const n = faker.datatype.number({ min: 1, max: 10 });
        for (let i = 0; i < n; i += 1) {
            const { username, profile_picture, bio } = fact.userGen();
            friends.push({
                username, profile_picture, bio,
            });
        }
        res(ctx.json(friends));
    }),
    rest.delete("/users/:username/friends/:fusername/", (req, res, ctx) => {
        const friends = [];
        const n = faker.datatype.number({ min: 1, max: 10 });
        for (let i = 0; i < n; i += 1) {
            const { username, profile_picture, bio } = fact.userGen();
            friends.push({
                username, profile_picture, bio,
            });
        }
        res(ctx.json(friends));
    }),

    rest.post("/repositories/", (req, res, ctx) => {
        const {
            repo_id, repo_name, owner, travel_start_date, travel_end_date, visibility, collaborators,
        } = fact.repoGen();
        res(ctx.json({
            repo_id, repo_name, owner, travel_start_date, travel_end_date, visibility, collaborators,
        }));
    }),
    rest.get("/repositories/", (req, res, ctx) => {
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
        res(ctx.json(repos));
    }),

    rest.get("/repositories/:repo_id/", (req, res, ctx) => {
        const {
            repo_id, repo_name, owner, travel_start_date, travel_end_date, visibility, collaborators,
        } = fact.repoGen();
        res(ctx.json({
            repo_id, repo_name, owner, travel_start_date, travel_end_date, visibility, collaborators,
        }));
    }),
    rest.delete("/repositories/:repo_id/", (req, res, ctx) => {
        res(ctx.status(200));
    }),
    rest.put("/repositories/:repo_id/", (req, res, ctx) => {
        const {
            repo_id, repo_name, owner, travel_start_date, travel_end_date, visibility, collaborators,
        } = fact.repoGen();
        res(ctx.json({
            repo_id, repo_name, owner, travel_start_date, travel_end_date, visibility, collaborators,
        }));
    }),

    rest.get("/repositories/:repo_id/collaborators/", (req, res, ctx) => {
        const collaborators = [];
        const n = faker.datatype.number({ min: 1, max: 5 });
        for (let i = 0; i < n; i += 1) {
            const { username, profile_picture, bio } = fact.userGen();
            collaborators.push({ username, profile_picture, bio });
        }
        res(ctx.json(collaborators));
    }),
    rest.post("/repositories/:repo_id/collaborators/", (req, res, ctx) => {
        const collaborators = [];
        const n = faker.datatype.number({ min: 1, max: 5 });
        for (let i = 0; i < n; i += 1) {
            const { username, profile_picture, bio } = fact.userGen();
            collaborators.push({ username, profile_picture, bio });
        }
        res(ctx.json(collaborators));
    }),

    rest.delete("/repositories/:repo_id/collaborators/:username", (req, res, ctx) => {
        const friends = [];
        const n = faker.datatype.number({ min: 1, max: 10 });
        for (let i = 0; i < n; i += 1) {
            const { username, profile_picture, bio } = fact.userGen();
            friends.push({
                username, profile_picture, bio,
            });
        }
        res(ctx.json(friends));
    }),
];

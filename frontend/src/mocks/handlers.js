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
                username, profile_picture, bio,
            } = fact.userGen();
            friends.push({
                username, profile_picture, bio,
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

    rest.get("/api/repositories/:repo_id/photos/", (req, res, ctx) => {
        const photos = [];
        const n = faker.datatype.number({ min: 10, max: 30 });
        for (let i = 0; i < n; i++) {
            const photo = fact.photoGen();
            photos.push(photo);
        }
        return res(ctx.json(photos));
    }),
    rest.post("/api/repositories/:repo_id/photos/", (req, res, ctx) => {
        const photos = [];
        const n = faker.datatype.number({ min: 10, max: 30 });
        for (let i = 0; i < n; i++) {
            const photo = fact.photoGen();
            photos.push(photo);
        }
        return res(ctx.json(photos));
    }),
    rest.put("/api/repositories/:repo_id/photos/", (req, res, ctx) => {
        const photos = [];
        const n = faker.datatype.number({ min: 10, max: 30 });
        for (let i = 0; i < n; i++) {
            const photo = fact.photoGen();
            photos.push(photo);
        }
        return res(ctx.json(photos));
    }),
    rest.delete("/api/repositories/:repo_id/photos/", (req, res, ctx) => {
        const photos = [];
        const n = faker.datatype.number({ min: 10, max: 30 });
        for (let i = 0; i < n; i++) {
            const photo = fact.photoGen();
            photos.push(photo);
        }
        return res(ctx.json(photos));
    }),

    rest.get("/api/repositories/:repo_id/discussions/", (req, res, ctx) => {
        const discussions = [];
        const n = faker.datatype.number({ min: 4, max: 10 });
        for (let i = 0; i < n; i++) {
            const discussion = fact.discussionGen();
            discussions.push(discussion);
        }
        return res(ctx.json(discussions));
    }),
    rest.post("/api/repositories/:repo_id/discussions/", (req, res, ctx) => {
        const disc = fact.discussionGen();
        return res(ctx.json({
            discussion_id: disc.discussion_id,
            repo_id: disc.repo_id,
            author: disc.author,
            title: disc.title,
            text: disc.text,
            post_time: disc.post_time,
        }));
    }),

    rest.get("/api/discussions/:discussion_id/", (req, res, ctx) => {
        console.log("dfd");
        const discussion = fact.discussionGen();
        return res(ctx.json(discussion));
    }),
    rest.put("/api/discussions/:discussion_id/", (req, res, ctx) => {
        const discussion = fact.discussionGen();
        return res(ctx.json(discussion));
    }),
    rest.delete("/api/discussions/:discussion_id", (req, res, ctx) => res(ctx.status(200))),
    rest.get("/api/discussions/:discussion_id/comments/", (req, res, ctx) => {
        const comments = [];
        const n = faker.datatype.number({ min: 0, max: 10 });
        for (let i = 0; i < n; i++) {
            const comment = fact.commentGen();
            comments.push(comment);
        }
        return res(ctx.json(comments));
    }),
    rest.post("/api/discussions/:discussion_id/comments", (req, res, ctx) => {
        const comments = [];
        const n = faker.datatype.number({ min: 0, max: 10 });
        for (let i = 0; i < n; i++) {
            const comment = fact.commentGen();
            comments.push(comment);
        }
        return res(ctx.json(comments));
    }),

    rest.get("/api/discussions/:discussion_id/comments/:discussion_comment_id/",
        (req, res, ctx) => res(ctx.json(fact.commentGen()))),
    rest.put("/api/discussions/:discussion_id/comments/:discussion_comment_id/", (req, res, ctx) => {
        const comments = [];
        const n = faker.datatype.number({ min: 0, max: 10 });
        for (let i = 0; i < n; i++) {
            const comment = fact.commentGen();
            comments.push(comment);
        }
        return res(ctx.json(comments));
    }),
    rest.delete("/api/discussions/:discussion_id/comments/:discussion_comment_id/", (req, res, ctx) => {
        const comments = [];
        const n = faker.datatype.number({ min: 0, max: 10 });
        for (let i = 0; i < n; i++) {
            const comment = fact.commentGen();
            comments.push(comment);
        }
        return res(ctx.json(comments));
    }),

    rest.get("/api/users/:username/posts/", (req, res, ctx) => {
        const posts = [];
        const n = faker.datatype.number({ min: 8, max: 15 });
        for (let i = 0; i < n; i++) {
            const post = fact.postGen();
            posts.push(post);
        }
        return res(ctx.json(posts));
    }),

    rest.get("/api/repositories/:repo_id/posts/", (req, res, ctx) => {
        const posts = [];
        const n = faker.datatype.number({ min: 8, max: 15 });
        for (let i = 0; i < n; i++) {
            const post = fact.postGen();
            posts.push({
                post_id: post.post_id,
                repo_id: post.repo_id,
                title: post.title,
                post_time: post.post_time,
                photos: post.photos,
            });
        }
        return res(ctx.json(posts));
    }),
    rest.post("/api/repositories/:repo_id/posts/", (req, res, ctx) => {
        const post = fact.postGen();
        return res(ctx.json({
            post_id: post.post_id,
            repo_id: post.repo_id,
            author: post.author,
            title: post.title,
            text: post.text,
            post_time: post.post_time,
            photos: post.photos,
            comments: [],
        }));
    }),

    rest.get("/api/posts/:post_id/", (req, res, ctx) => {
        const post = fact.postGen();
        return res(ctx.json(post));
    }),
    rest.put("/api/posts/:post_id/", (req, res, ctx) => {
        const post = fact.postGen();
        return res(ctx.json(post));
    }),
    rest.delete("/api/posts/:post_id/", (req, res, ctx) => res(ctx.status(200))),

    rest.get("/api/posts/:post_id/comments/", (req, res, ctx) => {
        const comments = [];
        const n = faker.datatype.number({ min: 0, max: 8 });
        for (let i = 0; i < n; i++) {
            const comment = fact.commentGen();
            comments.push(comment);
        }
        return res(ctx.json(comments));
    }),
    rest.post("/api/posts/:post_id/comments/", (req, res, ctx) => {
        const comments = [];
        const n = faker.datatype.number({ min: 0, max: 8 });
        for (let i = 0; i < n; i++) {
            const comment = fact.commentGen();
            comments.push(comment);
        }
        return res(ctx.json(comments));
    }),

    rest.get("/api/posts/:post_id/comments/:post_comment_id/", (req, res, ctx) => {
        const comment = fact.commentGen();
        return res(ctx.json(comment));
    }),
    rest.put("/api/posts/:post_id/comments/:post_comment_id/", (req, res, ctx) => {
        const comments = [];
        const n = faker.datatype.number({ min: 0, max: 8 });
        for (let i = 0; i < n; i++) {
            const comment = fact.commentGen();
            comments.push(comment);
        }
        return res(ctx.json(comments));
    }),
    rest.delete("/api/posts/:post_id/comments/:post_comment_id/", (req, res, ctx) => {
        const comments = [];
        const n = faker.datatype.number({ min: 0, max: 8 });
        for (let i = 0; i < n; i++) {
            const comment = fact.commentGen();
            comments.push(comment);
        }
        return res(ctx.json(comments));
    }),
];

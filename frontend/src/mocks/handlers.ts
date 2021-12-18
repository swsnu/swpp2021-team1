// src/mocks/handlers.js

import { rest } from "msw";
import { ILabel, IPhoto } from "../common/Interfaces";
import Factory from "./dataGenerator";
import mockData from "./mockData.json";

const fact = new Factory();

const dummyLabels: ILabel[] = [];
for (let i = 0; i < 5; i++) {
    const label = fact.labelGen();
    dummyLabels.push(label);
}
const dummyPhotos: IPhoto[] = [];
for (let i = 0; i < 8; i++) {
    const photo = {
        photo_id: i,
        repo_id: 1,
        image: mockData.photoUrls[i],
        post_time: "2021-10-11",
        tag: "abc",
        uploader: "abc",
    };
    dummyPhotos.push(photo);
}
export default [
    rest.get("/api/session/", (req, res, ctx) => {
        const user = fact.userGen();
        return res(ctx.json({
            username: user.username,
            bio: user.bio,
            profile_picture: user.profile_picture,
            visibility: user.visibility,
            real_name: user.real_name,
            email: user.email,
        }));
    }),
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
    rest.get("/api/users/:username/", (req, res, ctx) => {
        const fakeUser = fact.userGen();
        const friends = [];
        const n = 8;
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
        const n = 5;
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
        const n = 8;
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
        const n = 8;
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
        const n = 3;
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
        const n = 3;
        for (let i = 0; i < n; i += 1) {
            const { username, profile_picture, bio } = fact.userGen();
            collaborators.push({ username, profile_picture, bio });
        }
        return res(ctx.json(collaborators));
    }),
    rest.post("/api/repositories/:repo_id/collaborators/", (req, res, ctx) => {
        const collaborators = [];
        const n = 3;
        for (let i = 0; i < n; i += 1) {
            const { username, profile_picture, bio } = fact.userGen();
            collaborators.push({ username, profile_picture, bio });
        }
        return res(ctx.json(collaborators));
    }),

    rest.delete("/api/repositories/:repo_id/collaborators/:username", (req, res, ctx) => {
        const friends = [];
        const n = 3;
        for (let i = 0; i < n; i += 1) {
            const { username, profile_picture, bio } = fact.userGen();
            friends.push({
                username, profile_picture, bio,
            });
        }
        return res(ctx.json(friends));
    }),

    rest.get("/api/repositories/:repo_id/photos/", (req, res, ctx) => res(ctx.json(dummyPhotos))),
    rest.post("/api/repositories/:repo_id/photos/", (req, res, ctx) => res(ctx.json(dummyPhotos))),
    rest.put("/api/repositories/:repo_id/photos/", (req, res, ctx) => res(ctx.json(dummyPhotos))),
    rest.delete("/api/repositories/:repo_id/photos/", (req, res, ctx) => res(ctx.json(dummyPhotos))),

    rest.get("/api/repositories/:repo_id/discussions/", (req, res, ctx) => {
        const discussions = [];
        const n = 5;
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
        const n = 4;
        for (let i = 0; i < n; i++) {
            const comment = fact.commentGen();
            comments.push(comment);
        }
        return res(ctx.json(comments));
    }),
    rest.post("/api/discussions/:discussion_id/comments", (req, res, ctx) => {
        const comments = [];
        const n = 4;
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
        const n = 4;
        for (let i = 0; i < n; i++) {
            const comment = fact.commentGen();
            comments.push(comment);
        }
        return res(ctx.json(comments));
    }),
    rest.delete("/api/discussions/:discussion_id/comments/:discussion_comment_id/", (req, res, ctx) => {
        const comments = [];
        const n = 4;
        for (let i = 0; i < n; i++) {
            const comment = fact.commentGen();
            comments.push(comment);
        }
        return res(ctx.json(comments));
    }),

    rest.get("/api/users/:username/posts/", (req, res, ctx) => {
        const posts = [];
        const n = 8;
        for (let i = 0; i < n; i++) {
            const post = fact.postGen();
            posts.push(post);
        }
        return res(ctx.json(posts));
    }),

    rest.get("/api/repositories/:repo_id/posts/", (req, res, ctx) => {
        const posts = [];
        const n = 8;
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
        const n = 4;
        for (let i = 0; i < n; i++) {
            const comment = fact.commentGen();
            comments.push(comment);
        }
        return res(ctx.json(comments));
    }),
    rest.post("/api/posts/:post_id/comments/", (req, res, ctx) => {
        const comments = [];
        const n = 4;
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
        const n = 4;
        for (let i = 0; i < n; i++) {
            const comment = fact.commentGen();
            comments.push(comment);
        }
        return res(ctx.json(comments));
    }),
    rest.delete("/api/posts/:post_id/comments/:post_comment_id/", (req, res, ctx) => {
        const comments = [];
        const n = 4;
        for (let i = 0; i < n; i++) {
            const comment = fact.commentGen();
            comments.push(comment);
        }
        return res(ctx.json(comments));
    }),
    rest.get("/api/repositories/:repo_id/labels/", (req, res, ctx) => res(ctx.json(dummyLabels))),
    rest.post("/api/repositories/:repo_id/labels/", (req, res, ctx) => res(ctx.json(dummyLabels))),
    rest.put("/api/repositories/:repo_id/labels/:label_id/", (req, res, ctx) => res(ctx.json(dummyLabels))),
    rest.delete("/api/repositories/:repo_id/labels/:label_id/", (req, res, ctx) => res(ctx.json(dummyLabels))),
    rest.get("/api/repositories/:repo_id/labels/:label_id/photos/", (req, res, ctx) => res(ctx.json(dummyPhotos))),
    rest.put("/api/repositories/:repo_id/labels/:label_id/photos/", (req, res, ctx) => res(ctx.json(dummyPhotos))),
];

export const handlerException = (
    path: string, method: string,
) => {
    let returnValue;
    switch (method) {
    case "GET":
        returnValue = rest.get(path, (req, res, ctx) => res(ctx.status(500)));
        break;
    case "POST":
        returnValue = rest.post(path, (req, res, ctx) => res(ctx.status(500)));
        break;
    case "PUT":
        returnValue = rest.put(path, (req, res, ctx) => res(ctx.status(500)));
        break;
    default:
        returnValue = rest.delete(path, (req, res, ctx) => res(ctx.status(500)));
        break;
    }
    return returnValue;
};

export const getUserPostsHE = handlerException("/api/users/:username/posts/", "GET");
export const getRepoPostsHE = handlerException("/api/repositories/:repo_id/posts/", "GET");

export const postRepoPostHE = handlerException("/api/repositories/:repo_id/posts/", "POST");
export const getPostHE = handlerException("/api/posts/:post_id/", "GET");
export const putPostHE = handlerException("/api/posts/:post_id/", "PUT");
export const deletePostHE = handlerException("/api/posts/:post_id/", "DELETE");

export const getPostCommentsHE = handlerException("/api/posts/:post_id/comments/", "GET");
export const postPostCommentHE = handlerException("/api/posts/:post_id/comments/", "POST");
export const getPostCommentHE = handlerException("/api/posts/:post_id/comments/:post_comment_id/", "GET");
export const putPostCommentHE = handlerException("/api/posts/:post_id/comments/:post_comment_id/", "PUT");
export const deletePostCommentHE = handlerException("/api/posts/:post_id/comments/:post_comment_id/", "DELETE");

export const getLabelsHE = handlerException("/api/repositories/:repo_id/labels/", "GET");
export const postLabelHE = handlerException("/api/repositories/:repo_id/labels/", "POST");

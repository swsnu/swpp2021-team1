// src/mocks/handlers.js
import { rest } from "msw";

export default [
    rest.post("/signin/", (req, res, ctx) => {
        // Persist user's authentication in the session
        sessionStorage.setItem("is-authenticated", "true");

        return res(
            // Respond with a 200 status code
            ctx.status(200),
        );
    }),

    rest.get("/signout/", (req, res, ctx) => {

    }),

    rest.post("/users/", (req, res, ctx) => {
    // Check if the user is authenticated in this session
        const isAuthenticated = sessionStorage.getItem("is-authenticated");

        if (!isAuthenticated) {
            // If not authenticated, respond with a 403 error
            return res(
                ctx.status(403),
                ctx.json({
                    errorMessage: "Not authorized",
                }),
            );
        }

        // If authenticated, return a mocked user details
        return res(
            ctx.status(200),
            ctx.json({
                username: "admin",
            }),
        );
    }),

    rest.delete("/users/:username/", (req, res, ctx) => {

    }),
    rest.put("/users/:username/", (req, res, ctx) => {

    }),

    rest.get("/users/:username/friends/", (req, res, ctx) => {

    }),

    rest.post("/users/:username/friends/:fusername/", (req, res, ctx) => {

    }),
    rest.delete("/users/:username/friends/:fusername/", (req, res, ctx) => {

    }),

    rest.post("/repositories/", (req, res, ctx) => {

    }),
    rest.get("/repositories/", (req, res, ctx) => {
        const username = req.url.searchParams.get("username");
        const owner = req.url.searchParams.get("owner");
    }),

    rest.get("/repositories/:repo_id/", (req, res, ctx) => {

    }),
    rest.delete("/repositories/:repo_id/", (req, res, ctx) => {

    }),
    rest.put("/repositories/:repo_id/", (req, res, ctx) => {

    }),
    rest.get("/repositories/:repo_id/", (req, res, ctx) => {

    }),

    rest.get("/repositories/:repo_id/collaborators/", (req, res, ctx) => {

    }),
    rest.post("/repositories/:repo_id/collaborators/", (req, res, ctx) => {

    }),

    rest.delete("/repositories/:repo_id/collaborators/:username", (req, res, ctx) => {

    }),
];

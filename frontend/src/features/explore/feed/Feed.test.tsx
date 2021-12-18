import { mount } from "enzyme";
import { rest } from "msw";
import React, { useState } from "react";
import { act } from "react-dom/test-utils";
import { feedFactoryPersonal } from "../../../common/Interfaces";

import server from "../../../mocks/server";
import Feed from "./Feed";

jest.mock("./FeedEntry", () => () => (<div />));
jest.mock("./FeedEntryRepoPost", () => () => (<div />));

describe("Feed", () => {
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers);
    afterAll(() => server.close());
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should render entries", async () => {
        server.use(rest.get("/api/feeds/", (req, res, ctx) => res(ctx.json([
            feedFactoryPersonal(),
        ]))));
        const component = mount(<Feed />);
        await act(async () => {
            await Promise.resolve(component);
            await new Promise((resolve) => setImmediate(resolve));
            component.update();
        });
        expect(component.find("div[data-testid='feed']").children.length).toBe(1);
    });
});

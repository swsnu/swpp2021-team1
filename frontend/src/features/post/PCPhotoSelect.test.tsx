import { configureStore } from "@reduxjs/toolkit";

import { createBrowserHistory } from "history";
import { Provider } from "react-redux";
import { Route, Router } from "react-router";
import Factory from "../../mocks/dataGenerator";

import server from "../../mocks/server";
import PCPhotoSelect from "./PCPhotoSelect";
import postsReducer from "./postsSlice";

const fact = new Factory();

const history = createBrowserHistory();
const historyMock = { ...history, push: jest.fn(), listen: jest.fn() };

describe("PCPhotoSelect", () => {
    const photos = [fact.photoGen(), fact.photoGen()];
});

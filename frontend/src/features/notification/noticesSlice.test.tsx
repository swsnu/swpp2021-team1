import { configureStore } from "@reduxjs/toolkit";
import * as APIs from "../../common/APIs";
import { NoticeAnswerType, notificationFactory } from "../../common/Interfaces";
import noticeReducer, {
    fetchNotifications,
    fetchSession, removeNotification,
    removeNotifications,
    responseNotification,
} from "./noticesSlice";

jest.mock("../../common/APIs");
const mockedAPIs = APIs as jest.Mocked<typeof APIs>;

describe("noticesSlice", () => {
    let store = configureStore({
        reducer: {
            notices: noticeReducer,
        },
    });

    beforeEach(() => {
        store = configureStore({
            reducer: {
                notices: noticeReducer,
            },
        });
    });

    it("Should fetch session correctly", async () => {
        mockedAPIs.getNoticeSession.mockResolvedValue({ count: 5 });
        await store.dispatch(fetchSession());
        expect(store.getState().notices.count).toEqual(5);
    });

    it("Should fetch notices correctly", async () => {
        const notification = notificationFactory();
        mockedAPIs.getNotifications.mockResolvedValue([notification]);
        await store.dispatch(fetchNotifications());
        expect(store.getState().notices.notifications).toEqual([notification]);
        mockedAPIs.getNotifications.mockRejectedValue(undefined);
        await store.dispatch(fetchNotifications());
        expect(store.getState().notices.hasError).toBe(true);
    });

    it("Should remove notices correctly", async () => {
        const notification = notificationFactory();
        mockedAPIs.deleteNotifications.mockResolvedValue([notification]);
        await store.dispatch(removeNotifications());
        expect(store.getState().notices.notifications).toEqual([notification]);
        mockedAPIs.deleteNotifications.mockRejectedValue(undefined);
        await store.dispatch(removeNotifications());
        expect(store.getState().notices.hasError).toBe(true);
    });

    it("Should response notice correctly", async () => {
        const notification = notificationFactory();
        mockedAPIs.postNotification.mockResolvedValue([notification]);
        await store.dispatch(responseNotification({ id: 1, answer: NoticeAnswerType.YES }));
        expect(store.getState().notices.notifications).toEqual([notification]);
        mockedAPIs.postNotification.mockRejectedValue(undefined);
        await store.dispatch(responseNotification({ id: 1, answer: NoticeAnswerType.YES }));
        expect(store.getState().notices.hasError).toBe(true);
    });

    it("Should remove notice correctly", async () => {
        const notification = notificationFactory();
        mockedAPIs.deleteNotification.mockResolvedValue([notification]);
        await store.dispatch(removeNotification(1));
        expect(store.getState().notices.notifications).toEqual([notification]);
        mockedAPIs.deleteNotification.mockRejectedValue(undefined);
        await store.dispatch(removeNotification(1));
        expect(store.getState().notices.hasError).toBe(true);
    });
});

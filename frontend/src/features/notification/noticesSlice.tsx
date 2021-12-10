import {
    createAsyncThunk,
    createSlice,
    PayloadAction,
    SliceCaseReducers,
} from "@reduxjs/toolkit";
import {
    deleteNotification,
    deleteNotifications,
    getNoticeSession,
    getNotifications,
    postNotification,
} from "../../common/APIs";
import {
    INotification, NoticeAnswerType,
} from "../../common/Interfaces";

export const fetchSession = createAsyncThunk<{count : number}, void>(
    "notices/session",
    async () => // payload creator
        await getNoticeSession(),
);

export const fetchNotifications = createAsyncThunk<INotification[], void>(
    "notices/all",
    async () => // payload creator
        await getNotifications(),
);

export const removeNotifications = createAsyncThunk<INotification[], void>(
    "notices/remove_all",
    async () => // payload creator
        await deleteNotifications(),
);

export const responseNotification = createAsyncThunk<INotification[], {id : number, answer : NoticeAnswerType}>(
    "notices/response",
    async ({ id, answer }) => // payload creator
        await postNotification(id, answer),
);

export const removeNotification = createAsyncThunk<INotification[], number>(
    "notices/remove",
    async (id) => // payload creator
        await deleteNotification(id),
);

export const noticeInitState : NoticeState = {
    isLoading: true,
    hasError: false,
    count: 0,
    notifications: [],
};

interface NoticeState {
    isLoading : boolean,
    hasError : boolean,
    count : number,
    notifications : INotification[]
}

export const noticesSlice = createSlice<NoticeState, SliceCaseReducers<NoticeState>>({
    name: "labels",
    initialState: noticeInitState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder.addCase(fetchSession.fulfilled, (state: NoticeState, action : PayloadAction<{count : number}>) => {
            state.count = action.payload.count;
        });

        builder.addCase(fetchNotifications.pending, (state: NoticeState) => {
            state.isLoading = true;
            state.hasError = false;
        });
        builder.addCase(fetchNotifications.fulfilled, (state: NoticeState, action : PayloadAction<INotification[]>) => {
            state.isLoading = false;
            state.hasError = false;
            state.notifications = action.payload;
        });
        builder.addCase(fetchNotifications.rejected, (state: NoticeState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(removeNotifications.pending, (state: NoticeState) => {
            state.isLoading = true;
            state.hasError = false;
        });
        builder.addCase(removeNotifications.fulfilled,
            (state: NoticeState, action : PayloadAction<INotification[]>) => {
                state.isLoading = false;
                state.hasError = false;
                state.notifications = action.payload;
            });
        builder.addCase(removeNotifications.rejected, (state: NoticeState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(responseNotification.pending, (state: NoticeState) => {
            state.isLoading = true;
            state.hasError = false;
        });
        builder.addCase(responseNotification.fulfilled,
            (state: NoticeState, action : PayloadAction<INotification[]>) => {
                state.isLoading = false;
                state.hasError = false;
                state.notifications = action.payload;
            });
        builder.addCase(responseNotification.rejected, (state: NoticeState) => {
            state.isLoading = false;
            state.hasError = true;
        });

        builder.addCase(removeNotification.pending, (state: NoticeState) => {
            state.isLoading = true;
            state.hasError = false;
        });
        builder.addCase(removeNotification.fulfilled, (state: NoticeState, action : PayloadAction<INotification[]>) => {
            state.isLoading = false;
            state.hasError = false;
            state.notifications = action.payload;
        });
        builder.addCase(removeNotification.rejected, (state: NoticeState) => {
            state.isLoading = false;
            state.hasError = true;
        });
    },
});

export type { NoticeState };
export default noticesSlice.reducer;

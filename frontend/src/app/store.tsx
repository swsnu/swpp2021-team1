import { configureStore } from "@reduxjs/toolkit";
import { CombinedState } from "redux";
import authReducer, { AuthState } from "../features/auth/authSlice";
import reposReducer, { ReposState } from "../features/repository/reposSlice";
import postsReducer from "../features/post/postsSlice";
import photosReducer from "../features/photo/photosSlice";
import discussionsReducer from "../features/discussion/discussionsSlice";
import commentsReducer from "../features/comments/commentsSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        repos: reposReducer,
        posts: postsReducer,
        photos: photosReducer,
        discussions: discussionsReducer,
        comments: commentsReducer,
    /*
        repositories : filtersReducer,
        posts :
        */
    },
    // middleware: (getDefaultMiddleware) => {
    //     getDefaultMiddleware()
    //     .prepend(
    //         additionalMiddleware
    //     )
    //     .concat(logger)
    // }
});
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;
export default store;

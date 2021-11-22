import { configureStore } from "@reduxjs/toolkit";
import { CombinedState } from "redux";
import authReducer, { AuthState } from "../features/auth/authSlice";
import reposReducer, { ReposState } from "../features/repository/reposSlice";
import postsReducer from "../features/post/postsSlice";
import photosReducer from "../features/photo/photosSlice";
import discussionsReducer from "../features/discussion/discussionsSlice";
import routeReducer from "../features/route/routeSlice";
import labelsReducer from "../features/labels/labelsSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        repos: reposReducer,
        posts: postsReducer,
        photos: photosReducer,
        discussions: discussionsReducer,
        route: routeReducer,
        labels: labelsReducer,
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

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import reposReducer from "../features/repository/reposSlice";
import postsReducer from "../features/post/postsSlice";
import photosReducer from "../features/photo/photosSlice";
import discussionsReducer from "../features/discussion/discussionsSlice";
import routeReducer from "../features/route/routeSlice";
import labelsReducer from "../features/labels/labelsSlice";
import noticesReducer from "../features/notification/noticesSlice";
import searchReducer from "../features/explore/search/searchSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        repos: reposReducer,
        posts: postsReducer,
        photos: photosReducer,
        discussions: discussionsReducer,
        route: routeReducer,
        labels: labelsReducer,
        notices: noticesReducer,
        search: searchReducer,
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

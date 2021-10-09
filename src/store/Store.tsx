import { configureStore }from '@reduxjs/toolkit'
import userReducer, {UsersState} from './slice/UserSlice'
import {CombinedState} from "redux";

const store = configureStore({
    reducer: {
        users : userReducer,
        /*
        repositories : filtersReducer,
        posts :
        */
    }
})
const state = store.getState();
type StoreState = typeof state;
type StoreDispatch = typeof store.dispatch;
export type { StoreState , StoreDispatch }
export default store
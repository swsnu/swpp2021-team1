import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getFriends } from "../../common/APIs";
import { IUser } from "../../common/Interfaces";

interface FriendState {

};

export const friendInitialState: FriendState = {};

const friendSlice = createSlice({
  name: 'friend',
  initialState: friendInitialState,
  reducers: {

  },
  extraReducers: {

  }
});

export type {FriendState};
export const {} = friendSlice.actions;
export default friendSlice.reducer;
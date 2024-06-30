import { createSlice } from "@reduxjs/toolkit";

const roomSlice = createSlice({
  name: "room",
  initialState: {},
  reducers: {
    updateProfileAction: (state, { payload }) => {},
  },
});

export const { updateProfileAction } = roomSlice.actions;

export default roomSlice;

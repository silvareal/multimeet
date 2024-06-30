import { createSlice } from "@reduxjs/toolkit";

const producerSlice = createSlice({
  name: "producer",
  initialState: {},
  reducers: {
    updateProfileAction: (state, { payload }) => {},
  },
});

export const { updateProfileAction } = producerSlice.actions;

export default producerSlice;

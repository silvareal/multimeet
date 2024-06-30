import { createSlice } from "@reduxjs/toolkit";

const consumerSlice = createSlice({
  name: "consumer",
  initialState: {},
  reducers: {
    updateProfileAction: (state, { payload }) => {},
  },
});

export const { updateProfileAction } = consumerSlice.actions;

export default consumerSlice;

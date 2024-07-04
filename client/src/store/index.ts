import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import roomSlice from "./room.slice";

const store = configureStore({
  reducer: {
    [roomSlice.name]: roomSlice.reducer,
  },
});

setupListeners(store.dispatch);

export default store;

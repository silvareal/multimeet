import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import consumerSlice from "./consumer.slice";
import producerSlice from "./producer.slice";
import roomSlice from "./room.slice";

const store = configureStore({
  reducer: {
    [consumerSlice.name]: consumerSlice.reducer,
    [producerSlice.name]: producerSlice.reducer,
    [roomSlice.name]: roomSlice.reducer,
  },
});

setupListeners(store.dispatch);

export default store;

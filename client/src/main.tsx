// import React from "react";
import ReactDOM from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

import "./index.css";
import Home from "./pages/Home";
import Meeting from "./pages/meeting/Meeting";
import store from "./store";
import StreamProvider from "./providers/StreamProvider";
import { ToastContainer } from "react-toastify";
import RoomClientProvider from "./providers/RoomClientProvider";
import RoomStateProvider from "providers/RoomProvider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/:id",
    element: <Meeting />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <ReduxProvider store={store}>
    <ToastContainer
      position="bottom-left"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
    />

    <RoomClientProvider>
      <RoomStateProvider>
        <StreamProvider>
          <RouterProvider router={router} />
        </StreamProvider>
      </RoomStateProvider>
    </RoomClientProvider>
  </ReduxProvider>
  // </React.StrictMode>
);

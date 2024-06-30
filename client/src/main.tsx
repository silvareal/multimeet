import React from "react";
import ReactDOM from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SnackbarProvider } from "notistack";

import "react-toastify/dist/ReactToastify.css";

import "./index.css";
import Home from "./pages/Home";
import Meeting from "./pages/meeting/Meeting";
import store from "./store";
import StreamProvider from "./providers/StreamProvider";
import RoomProvider from "./providers/RoomProvider";
import { ToastContainer } from "react-toastify";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/:meetingId",
    element: <Meeting />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <SnackbarProvider maxSnack={1}>
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

        <RoomProvider>
          <StreamProvider>
            <RouterProvider router={router} />
          </StreamProvider>
        </RoomProvider>
      </SnackbarProvider>
    </ReduxProvider>
  </React.StrictMode>
);

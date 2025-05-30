import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import { router } from "./Routes/router";
import AuthProvider from "./Provider/AuthProvider";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <RouterProvider router={router}></RouterProvider>
  </AuthProvider>
);

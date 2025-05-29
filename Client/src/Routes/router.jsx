import { createBrowserRouter } from "react-router";
import LoginPage from "../Pages/LoginPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage></LoginPage>,
  },
]);

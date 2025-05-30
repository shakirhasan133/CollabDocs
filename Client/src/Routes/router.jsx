import { createBrowserRouter } from "react-router";
import LoginPage from "../Pages/LoginPage";
import SignUpPage from "../Pages/SignUpPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage></LoginPage>,
  },
  {
    path: "/register",
    element: <SignUpPage></SignUpPage>,
  },
  {
    path: "/dashboard",
    element: <SignUpPage></SignUpPage>,
  },
]);

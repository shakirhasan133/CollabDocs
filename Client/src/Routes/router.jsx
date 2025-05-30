import { createBrowserRouter } from "react-router";
import LoginPage from "../Pages/LoginPage";
import SignUpPage from "../Pages/SignUpPage";
import Dashboard from "../Layout/Dashboard";
import MyFile from "../Components/PrivateComponent/MyFile";
import SharedDocument from "../Components/PrivateComponent/SharedDocument";

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
    element: <Dashboard></Dashboard>,
    children: [
      {
        index: true,
        element: <MyFile></MyFile>,
      },
      {
        path: "my-documents",
        element: <MyFile></MyFile>,
      },
      {
        path: "shared",
        element: <SharedDocument></SharedDocument>,
      },
    ],
  },
]);

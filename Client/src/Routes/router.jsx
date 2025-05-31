import { createBrowserRouter } from "react-router";
import LoginPage from "../Pages/LoginPage";
import SignUpPage from "../Pages/SignUpPage";
import Dashboard from "../Layout/Dashboard";
import MyFile from "../Components/PrivateComponent/MyFile";
import SharedDocument from "../Components/PrivateComponent/SharedDocument";
import NewDocuments from "../Components/PrivateComponent/NewDocuments";
import DocumentDetails from "../Components/PrivateComponent/DocumentDetails";
import ActiveUser from "../Components/PrivateComponent/ActiveUser";
import PrivateRoutes from "./PrivateRoutes";

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
    element: (
      <PrivateRoutes>
        <Dashboard></Dashboard>
      </PrivateRoutes>
    ),
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
      {
        path: "new-document",
        element: <NewDocuments></NewDocuments>,
      },
      {
        path: "active-user",
        element: <ActiveUser></ActiveUser>,
      },
      {
        path: "documents/:id",
        element: <DocumentDetails></DocumentDetails>,
      },
    ],
  },
]);

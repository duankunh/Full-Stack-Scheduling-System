import { useAuth } from "../providers/authProvider.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Home from "../pages/Home/Home.jsx";
import Contacts from "../pages/Contacts/Contacts.jsx";
import Login from "../pages/Login/Login.jsx";
import Signup from "../pages/Signup/Signup.jsx";
import Calendars from "../pages/Calendars/Calendars.jsx";
import Logout from "../pages/Logout/Logout.jsx";
import SetPreference from "../pages/Preference/SetPreference.jsx";

import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider
} from "react-router-dom";
import App from "../App.jsx";

const protectedRoutes = [
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <App />,
        children: [
          {
            path: "/",
            element: <Home />
          },
          {
            path: "/contacts",
            element: <Contacts />
          },
          {
            path: "/profile",
            element: <div>Profile</div>
          },
          {
            path: "/calendars",
            element: <Calendars />
          },
          {
            path: "/logout",
            element: <Logout />
          }
        ]
      }
    ]
  }
];

const NotAuthenticatedRoute = () => {
  const { accessToken } = useAuth();

  if (accessToken) {
    return <Navigate to={"/"} />;
  }
  return <Outlet />

}


const routesForNotAuthenticated = [
  {
    path: "/auth",
    element: <NotAuthenticatedRoute />,
    children: [
      {
        path: "/auth/login",
        element: <Login />,
      },
      {
        path: "/auth/signup",
        element: <Signup />,
      },

    ]
  },
  // preference page
  {
    path: "/scheduler/meetings/:meeting_id/set_preference/:preference_id",
    element: <SetPreference />,
  },

]


const Routes = () => {
  const { accessToken } = useAuth();

  const router = createBrowserRouter([
    ...protectedRoutes,
    ...routesForNotAuthenticated,
  ]);

  return <RouterProvider router={router} />
}

export default Routes;

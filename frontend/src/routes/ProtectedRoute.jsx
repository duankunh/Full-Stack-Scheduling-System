import {useAuth} from "../providers/authProvider.jsx";
import {Navigate, Outlet} from "react-router-dom";
import App from "../App.jsx";

const ProtectedRoute = () => {
  const { accessToken } = useAuth();
  // check if the user is authenticated
  if (!accessToken) {
    // if not authenticated, redirect to the login page
    return <Navigate to={'/auth/login'} />;
  }
  return <Outlet />;
}

export default ProtectedRoute;


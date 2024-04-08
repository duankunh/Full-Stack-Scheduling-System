import api from "../api.js";
import {createContext, useContext, useEffect, useMemo, useState} from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
}


const AuthProvider = ({ children }) => {
  // state to hold the authentication token
  const [accessToken, setAccessToken] = useState(localStorage.getItem("access"));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refresh"));

  // the function to set the authentication token
  const updateToken = (newAccessToken, newRefreshToken) => {
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
  }

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setAccessToken("");
    setRefreshToken("");
  }

  useEffect(() => {
      if (accessToken) {
        // during login or app refresh
        api.defaults.headers.common["Authorization"] = "Bearer " + accessToken;
        localStorage.setItem('access', accessToken);
      } else {
        // during logout or first time on app
        delete api.defaults.headers.common["Authorization"];
        localStorage.removeItem('access');
      }
  }, [accessToken]);

  useEffect(() => {
    if (refreshToken) {
        // during login or app refresh
        localStorage.setItem('refresh', refreshToken);
      } else {
        // during logout or first time on app
        localStorage.removeItem('refresh');
      }
  });


  const contextValue = useMemo(() => {
    return { accessToken, updateToken, logout };
  }, [accessToken]);

  // the provider provides global state / variables to the children components
  return <AuthContext.Provider value={contextValue}>
    {children}
  </AuthContext.Provider>
}
export default AuthProvider;

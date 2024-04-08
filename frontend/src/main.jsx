import React from 'react'
import ReactDOM from 'react-dom/client';



import Home from './pages/Home/Home.jsx';
import Contacts from './pages/Contacts/Contacts.jsx'
import Login from './pages/Login/Login.jsx'
import App from './App.jsx';
import Signup from "./pages/Signup/Signup.jsx";
import './index.css';
import AuthProvider from "./providers/authProvider.jsx";
import Routes from "./routes/Routes.jsx";

//
// const router = createBrowserRouter(
//   createRoutesFromElements(
//     <Route path="/" element={<App />}>
//       <Route index={true} element={<Login />} />
//       <Route path="signup" element={<Signup />} />
//       <Route path="home" element={<Home />} />
//       <Route
//         path="contacts"
//         element={<Contacts />}
//       />
//       <Route
//         path="profile"
//         element={<div>Profile</div>}
//       />
//     {/*  schedule page */}
//     {/* login page */}
//     {/* registration page */}
//     </Route>
//   )
// );


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Routes />
    </AuthProvider>
  </React.StrictMode>
);

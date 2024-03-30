import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";


import Home from './pages/Home/Home.jsx';
import Contacts from './pages/Contacts/Contacts.jsx'
import App from './App.jsx';
import './index.css';


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index={true} element={<Home />} />
      <Route
        path="contacts"
        element={<Contacts />}
      />
      <Route
        path="profile"
        element={<div>Profile</div>}
      />
    {/*  schedule page */}
    {/* login page */}
    {/* registration page */}
    </Route>
  )
);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  </React.StrictMode>
);

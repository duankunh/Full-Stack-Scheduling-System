import { useState } from 'react'
import clockSrc from './assets/clock.png';
import socialLabelSrc from './assets/social-label.png';
import viteLogo from '/vite.svg'
import './App.css'
import {NavLink, Outlet} from "react-router-dom";
import {useAuth} from "./providers/authProvider.jsx";

// its not html, its called jsx


function App() {
  const [count, setCount] = useState(0);
  const name = "david";


  const { logout } = useAuth();

  return (
      <div id="page-container">
        <div id="page-wrapper">
          <header>
            <nav className="navbar">
              <div className="navbar__logo">
                <img className="nabar__logo__image" src={clockSrc} />
                <NavLink
                  to="/"
                  className="navbar__logo__text"
                >
                  BESTSCHEDULE
                </NavLink>
              </div>
              <div className="navbar__links">
                <NavLink
                  to="/contacts"
                  className="navbar__nav-link"
                >
                  Contacts
                </NavLink>
                <NavLink
                  to="/calendars"
                  className="navbar__nav-link"
                >
                  Calendars
                </NavLink>
                <NavLink
                  to="/profile"
                  className="navbar__nav-link"
                >
                  Schedule
                </NavLink>
                <a onClick={logout} className="navbar__nav-link">Logout</a>
              </div>
            </nav>
          </header>


          <main id="page-content">
            <Outlet />
          </main>


        </div>
        <footer id="footer">
          <div id="footer-1">
            <div className="footer-1__col">
              <p className="footer-1__col__row footer-1--header">Contact</p>
              <p className="footer-1__col__row">Sign up for free</p>
              <p className="footer-1__col__row">Talk to sales</p>
              <p className="footer-1__col__row">Help center</p>
            </div>
            <div className="footer-1__col">
              <p className="footer-1__col__row footer-1--header">Company</p>
              <p className="footer-1__col__row">Customers</p>
              <p className="footer-1__col__row">About us</p>
              <p className="footer-1__col__row">Careers</p>
            </div>
            <div className="footer-1__col">
              <p className="footer-1__col__row footer-1--header">Downloads</p>
              <p className="footer-1__col__row">IOS</p>
              <p className="footer-1__col__row">Android</p>
              <p className="footer-1__col__row">Windows</p>
            </div>
            <div className="footer-1__col">
              <p className="footer-1__col__row footer-1--header">Resources</p>
              <p className="footer-1__col__row">Blog</p>
              <p className="footer-1__col__row">Community</p>
              <p className="footer-1__col__row">Become a Partner</p>
            </div>
          </div>
          <div id="page-footer-2">
            <div id="page-footer-2-1">Follow our social media for newest
              Update!
            </div>
            <div id="page-footer-2-2">
              <img src={socialLabelSrc} />
            </div>
          </div>
        </footer>
      </div>
  )
}

export default App

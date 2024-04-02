import React, {useState} from "react";
import api from "../../api.js";
import './Login.css';
import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "../../providers/authProvider.jsx";

const Login = () =>{
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ username: '', password: '' });
  const { updateToken } = useAuth();
  const navigate = useNavigate();

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (!e.target.value) {
      setErrors({ ...errors, username: "Please provide username" });
    } else {
      setErrors({...errors, username: ''});
    }
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (!e.target.value) {
      setErrors({
        ...errors,
        password: "Please provide password"
      });
    } else {
      setErrors({...errors, password: ''});
    }
  }


  const handleFocus = () => {
    setErrors({username: '', password: ''});
  }

  const handleSubmit = async (event) => {
    // when username or password are missing
    event.preventDefault();
    if (!username || !password) {
      return;
    }
    try{
      const response = await api.post('/accounts/login/', {
        username,
        password
      });
      // localStorage.setItem('access', response.data.access);
      // localStorage.setItem('refresh', response.data.refresh);
      updateToken(response.data.access, response.data.refresh);
      navigate('/'); // navigate to the home page
    } catch (error){
      // will add message showing that login fail
      console.error('Login failed:', error.response);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Account Login</h2>
        <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            style={{ border: errors.username ? '2px solid red' : '' }}
            value={username}
            onChange={handleUsernameChange}
          />
          <p style={{ color: 'red' }}>{errors.username}</p>

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            style={{ border: errors.password ? '2px solid red' : '' }}
            onChange={handlePasswordChange}
            autoComplete="new-password"
          />
          <p style={{ color: 'red' }}>{errors.password}</p>
              <button type="submit">SIGN IN</button>
        </form>
        <div className="login-help">
          {/*<Link to="/forgot-password">Forgot Username / Password?</Link>*/}
          <Link to="/signup">Create an account? Sign up</Link>
        </div>
      </div>
    </div>
  )

};

export default Login



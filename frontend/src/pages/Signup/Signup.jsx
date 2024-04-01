import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./Registration.css"
import {Link} from "react-router-dom";

const Register = () => {
  const [userRegistration, setUserRegistration] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserRegistration({
      ...userRegistration,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Replace '/register/' with your backend's registration endpoint
      const response = await axios.post('/accounts/register/', userRegistration);
      // Handle the response. For example, save the token, if provided
      localStorage.setItem('token', response.data.token);
      // Redirect to the login page or dashboard
      navigate('/accounts/login');
    } catch (error) {
      // Handle errors, such as displaying validation messages from your backend
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      }
    }
  };

  return (
    <div className="registration-container">
      {/* Registration form */}
      <form onSubmit={handleSubmit}>
        {/* Email field */}
        <input
          type="email"
          name="email"
          value={userRegistration.email}
          onChange={handleInputChange}
          required
        />
        {/* Password field */}
        <input
          type="password"
          name="password"
          value={userRegistration.password}
          onChange={handleInputChange}
          required
        />
        {/* Submit button */}
        <button type="submit">Register</button>
        {/* Displaying errors */}
        {errors.email && <p>{errors.email}</p>}
        {errors.password && <p>{errors.password}</p>}
      </form>
      <div className="signup-help">
        <Link to="/">Already have an account? Log in</Link>
      </div>
    </div>
  );
};

export default Register;

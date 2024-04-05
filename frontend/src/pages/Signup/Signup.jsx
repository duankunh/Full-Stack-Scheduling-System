import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState({});
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError({ ...error, confirmPassword: "Passwords do not match." });
      return;
    }
    try {
      const dataToSend = {
        name: formData.username,
        email: formData.email,
        password: formData.password,
      };
      const response = await api.post('accounts/register/', dataToSend);
      navigate('/auth/login'); // Adjust according to your routing
    } catch (error) {
      console.error('Signup failed:', error);
      setError({ ...error });
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create Account</h2>
        <form className="signup-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />

          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />

          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />

          {error.confirmPassword && <p className="error-message">{error.confirmPassword}</p>}
          <button type="submit">SIGN UP</button>
        </form>
        <div className="signup-help">
          <Link to="/auth/login">Already have an account? Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;

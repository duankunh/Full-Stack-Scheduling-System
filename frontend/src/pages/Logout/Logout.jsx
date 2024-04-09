import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {useAuth} from "../../providers/authProvider.jsx";

const Logout = () => {
    console.log('Executing logout1...');
  const navigate = useNavigate();
  const { updateToken } = useAuth();

  useEffect(() => {
    updateToken(null, null);

     setTimeout(() => navigate('/auth/login'), 100);
  }, [navigate]);

  return (
    <div className="logout-container">
      <p>Logging out successfully</p>
    </div>
  );
};

export default Logout;

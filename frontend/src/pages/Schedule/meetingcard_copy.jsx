import React, { useState, useEffect } from 'react';
import api from '../../api';




const MeetingCard = ({ meeting }) => {

  return (
    <div className="meeting-card">
      <h3>{meeting.name}</h3>
      <p>Date: {meeting.date}</p>
      <p>Duration: {meeting.duration}</p>
      {/* Display preferences and status here */}
      {/* Implement buttons for displaying preferences and scheduling */}
    </div>
  );
};


export default MeetingCard;

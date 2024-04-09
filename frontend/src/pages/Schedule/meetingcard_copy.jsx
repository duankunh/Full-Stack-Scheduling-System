import React, { useState, useEffect } from 'react';
import api from '../../api';




const MeetingCard = ({ meeting }) => {

  return (
    <div className="meeting-card">
      <h3>{meeting.name}</h3>
      <p>Date: {meeting.date}</p>
      <p>Duration: {meeting.duration}</p>

    </div>
  );
};


export default MeetingCard;

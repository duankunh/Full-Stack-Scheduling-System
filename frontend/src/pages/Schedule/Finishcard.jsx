import React, { useState, useEffect } from 'react';
import api from '../../api';

const Finishcard = ({ meeting }) => {
  const [finalizedSchedule, setFinalizedSchedule] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await api.get(`/scheduler/meetings/${meeting.id}/finalized/`);
        console.log(response.data);
        if (response.data.proposals && response.data.proposals.length > 0) {
          setFinalizedSchedule(response.data.proposals[0]);
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
      }
    };

    fetchSchedule();
  }, [meeting.id]); // Added meeting.id as a dependency for re-fetching when meeting changes

  return (
    <div className="finish-card">
      <h3>{meeting.name}</h3>
      <p>Date: {meeting.date}</p>
      <p>Duration: {meeting.duration}</p>
      {finalizedSchedule && ( // Check if finalizedSchedule exists before trying to access its properties
        <>
          <p>Start Time: {finalizedSchedule.start_time}</p>
          <p>End Time: {finalizedSchedule.end_time}</p>
        </>
      )}
    </div>
  );
};

export default Finishcard;

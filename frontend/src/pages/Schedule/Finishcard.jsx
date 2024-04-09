import React, { useState, useEffect } from 'react';
import api from '../../api';
import './Finishcard.css';

const Finishcard = ({ meeting, onUnfinalize }) => {
  const [finalizedSchedule, setFinalizedSchedule] = useState(null);
  const [schedules, setSchedules] = useState([]);

  const fetchSchedules = async () => {
    try {
      const response = await api.get(`/scheduler/meetings/${meeting.id}/proposals/`);
      setSchedules(response.data.proposals);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

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

  const handleUnfinalizeProposal = async (scheduleId) => {
    try {
      console.log('makabaka')
      await api.put(`/scheduler/meetings/${meeting.id}/unfinalized/${scheduleId}/`);
      alert("Schedule unfinalized successfully.");
      await fetchSchedules();
      onUnfinalize();
    } catch (error) {
      console.log('abaaaba')
      console.error("Error finalizing schedule:", error);
      alert("Failed to finalize schedule.");
    }
  };

  return (
    <div className="finish-card">
      <h3>{meeting.name}</h3>
      <div className="details">
        <p><strong>Date:</strong> {meeting.date}</p>
        <p><strong>Duration:</strong> {meeting.duration}</p>
        <p><strong>Contacts:</strong> {meeting.contacts}</p>
      </div>
      {finalizedSchedule && (
        <div className="schedule-details">
          <p><strong>Start Time:</strong> {finalizedSchedule.start_time}</p>
          <p><strong>End Time:</strong> {finalizedSchedule.end_time}</p>
          <button onClick={() => handleUnfinalizeProposal(finalizedSchedule.id)}>Unfinalize Proposal</button>
        </div>
        
      )}
    </div>
  );
};

export default Finishcard;

import React, { useState, useEffect } from 'react';
import api from '../../api';

const MeetingCard = ({ meeting, onFinalize }) => {
  const [preferences, setPreferences] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const fetchSchedules = async () => {
    try {
      const response = await api.get(`/scheduler/meetings/${meeting.id}/proposals/`);
      setSchedules(response.data.proposals);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await api.get(`/scheduler/meetings/${meeting.id}/set_preference/`);
        setPreferences(response.data.preference);
      } catch (error) {
        console.error("Error fetching preferences:", error);
      }
    };
    (async function() {
      await fetchPreferences();
      await fetchSchedules();
    }());
  }, [meeting.id]);

  const handleSendReminder = async () => {
    try {
      await api.get(`/scheduler/meetings/${meeting.id}/remind/`);
      alert("Reminder sent successfully.");
    } catch (error) {
      console.error("Error sending reminder:", error);
      alert("Failed to send reminder.");
    }
  };

  const handleProposalMeetingTime = async () => {
    const meetingData = {
      start_time: startTime,
      end_time: endTime
    };

    try {
      await api.post(`/scheduler/meetings/${meeting.id}/proposals/`, meetingData);
      alert("Meeting time proposal sent successfully.");
      setIsFormVisible(false);
      setStartTime('');
      setEndTime('');
      await fetchSchedules();
    } catch (error) {
      console.error("Error proposing meeting time:", error);
      alert("Failed to propose meeting time.");
    }
  };

  const handleFinalizeProposal = async (scheduleId) => {
    try {
      console.log('makabaka')
      await api.put(`/scheduler/meetings/${meeting.id}/finalized/${scheduleId}/`);
      alert("Schedule finalized successfully.");
      await fetchSchedules();
      onFinalize();
    } catch (error) {
      console.log('abaaaba')
      console.error("Error finalizing schedule:", error);
      alert("Failed to finalize schedule.");
    }
  };

  const toggleForm = () => setIsFormVisible(!isFormVisible);

  return (
    <div className="meeting-card">
      <h3>{meeting.name}</h3>
      <p>Date: {meeting.date}</p>
      <p>Duration: {meeting.duration}</p>
      <button onClick={toggleForm}>Proposal Meeting Time</button>
      {preferences.map((preference) => (
        <div key={preference.id}>
          <p>Contact: {preference.contact.name}</p>
          {preference.status !== 'Accepted' && (
            <>
              <p>Status: {preference.status}</p>
              <button onClick={handleSendReminder}>Remind</button>
            </>
          )}
          {preference.status === 'Accepted' && (
            <>
              <p>Start Time: {preference.start_time}</p>
              <p>End Time: {preference.end_time}</p>
              <p>Preference Level: {preference.preference_level}</p>
              <p>Status: {preference.status}</p>
            </>
          )}
        </div>
      ))}

      {isFormVisible && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={toggleForm}>&times;</span>
            <label>Start Time (HH:MM:SS):<input type="text" value={startTime} onChange={e => setStartTime(e.target.value)} /></label>
            <label>End Time (HH:MM:SS):<input type="text" value={endTime} onChange={e => setEndTime(e.target.value)} /></label>
            <button onClick={handleProposalMeetingTime}>Submit Proposal</button>
          </div>
        </div>
      )}

      {schedules.length > 0 && schedules.map((schedule) => (
        <div key={schedule.id}>
          <p>Start Time: {schedule.start_time}</p>
          <p>End Time: {schedule.end_time}</p>
          <button onClick={() => handleFinalizeProposal(schedule.id)}>Finalize Proposal</button>
        </div>
      ))}
    </div>
  );
};

export default MeetingCard;

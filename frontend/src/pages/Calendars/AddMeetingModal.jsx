import "./AddMeetingModal.css";
import React, { useState, useEffect } from 'react';
import api from "../../api.js";

function AddMeetingModal({ show, onClose, onOperationComplete, calendarId, currentMeeting = null }) {
  const [meetingName, setMeetingName] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingDuration, setMeetingDuration] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (currentMeeting) {
      setMeetingName(currentMeeting.name);
      setMeetingDate(currentMeeting.date);
      setMeetingDuration(currentMeeting.duration);
      setIsEditMode(true);
    } else {
      setMeetingName('');
      setMeetingDate('');
      setMeetingDuration('');
      setIsEditMode(false);
    }
  }, [currentMeeting]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const meetingData = {
      name: meetingName,
      date: meetingDate,
      duration: meetingDuration * 60,
      calendar: calendarId,
    };

    try {
      if (isEditMode  && currentMeeting) {
        await api.put(`/scheduler/meetings/${currentMeeting.id}/`, meetingData);
      } else {
        await api.post(`scheduler/calendars/${calendarId}/initiate_meeting/`, meetingData);
      }
      if (onOperationComplete) {
      onOperationComplete(calendarId);
    }
      onClose(true);
    } catch (error) {
      console.error('Failed to save meeting:', error);
      onClose(false); // Indicate failure but still close modal, or handle differently
    }
  };

  if (!show) return null; // Don't render if not set to show

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <span className="close" onClick={() => onClose(false)}>&times;</span>
        <h2>{isEditMode ? 'Edit Meeting' : 'Add New Meeting'}</h2>
        <form onSubmit={handleFormSubmit}>
          <label htmlFor="meetingName">Meeting Name:</label>
          <input
            type="text"
            id="meetingName"
            value={meetingName}
            onChange={(e) => setMeetingName(e.target.value)}
            required
          />
          <label htmlFor="meetingDate">Date:</label>
          <input
            type="date"
            id="meetingDate"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            required
          />
          <label htmlFor="meetingDuration">Duration (seconds):</label>
          <input
            type="number"
            id="meetingDuration"
            value={meetingDuration} 
            onChange={(e) => setMeetingDuration(e.target.value)}
            required
          />
          <button type="submit">{isEditMode ? 'Update Meeting' : 'Add Meeting'}</button>
        </form>
      </div>
    </div>
  );
}

export default AddMeetingModal;

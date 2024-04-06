import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';
import './SetPreference.css'

const SetPreference = () => {
  let { meeting_id, preference_id } = useParams();
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [preferenceLevel, setPreferenceLevel] = useState('medium');
  // Initialize status with a default value of 'Accepted'
  const [status, setStatus] = useState('Accepted');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Include status in the preferenceData object
    const preferenceData = {
      start_time: startTime,
      end_time: endTime,
      preference_level: preferenceLevel,
      status, // this is shorthand for status: status
    };

    try {
      const response = await api.put(`/scheduler/meetings/${meeting_id}/preference/${preference_id}/`, preferenceData);
      if (response.status === 200) {
        alert('Your preferences have been saved successfully.');
      } else {
        alert('Failed to save preferences.');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Error saving preferences.');
    }
  };

  return (
    <div>
      <h2>Set Your Meeting Preferences</h2>
      <form onSubmit={handleSubmit}>
        <div class="label-group">
          <label for="startTime">Start Time:</label>
          <div class="input-group">
            <input class="input" type="time" id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          </div>
        </div>
        <div class="label-group">
          <label for="endTime">End Time:</label>
          <div class="input-group">
            <input class="input" type="time" id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </div>
        </div>
        <div class="label-group">
          <label for="preferenceLevel">Preference Level:</label>
          <div class="input-group">
            <select class="input" id="preferenceLevel" value={preferenceLevel} onChange={(e) => setPreferenceLevel(e.target.value)}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <div class="label-group">
          <label for="status">Status:</label>
          <div class="input-group">
            <select class="input" id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
        <button type="submit">Submit Preferences</button>
      </form>
    </div>

  );
};

export default SetPreference;

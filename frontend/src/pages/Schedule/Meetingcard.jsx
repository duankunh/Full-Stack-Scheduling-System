import React, { useState, useEffect } from 'react';
import api from '../../api';




const MeetingCard = ({ meeting }) => {
  const [preferences, setPreferences] = useState([]);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await api.get(`/scheduler/meetings/${meeting.id}/set_preference/`);
        setPreferences(response.data.preference);
      } catch (error) {
        console.error("Error fetching preferences:", error);
      }
    };
    fetchPreferences();
  }, [meeting.id]);

  const handleSendReminder = async () => {
  try {

    await api.post(`/scheduler/meetings/${meeting.id}/remind/`);
    alert("Reminder sent successfully.");
  } catch (error) {
    console.error("Error sending reminder:", error);
    alert("Failed to send reminder.");
  }
};

  return (
    <div className="meeting-card">
      <h3>{meeting.name}</h3>
      <p>Date: {meeting.date}</p>
      <p>Duration: {meeting.duration}</p>
      {preferences.map((preference) => (
        <div key={preference.id}>
          <p>Contact: {preference.contact.name}</p>
          {preference.status !== 'Accepted' && (
            <p onClick={() => handleSendReminder(preference.id)}>Status: {preference.status} (Click to remind)</p>
          )}
          {preference.status === 'Accepted' && (
            <>
              <p>Start Time: {preference.startTime}</p>
              <p>End Time: {preference.endTime}</p>
              <p>Preference Level: {preference.preferenceLevel}</p>
            </>
          )}
        </div>
      ))}
      {/*<ScheduleModal meetingId={meeting.id} />*/}
    </div>
  );
};


export default MeetingCard;

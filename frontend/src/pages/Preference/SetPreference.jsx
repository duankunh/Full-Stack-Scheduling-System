import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';
import './SetPreference.css'
import AppCalendar from "../../components/AppCalendar.jsx";

const SetPreference = () => {
  let { meeting_id, preference_id } = useParams();
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [preferenceLevel, setPreferenceLevel] = useState('medium');
  const [status, setStatus] = useState('Accepted');
  const [finalizedMeetings, setFinalizedMeetings] = useState([]);
  const [meetingSchedule, setMeetingSchedule] = useState([]);
  const [showFinalizedSchedules, setShowFinalizedSchedules] = useState(false);

  useEffect(() => {
    fetchMeetings();

  }, []);


    const fetchMeetings = async () => {
    try {
      const resFinalized = await api.get(`/scheduler/finalisedmeeting/`);
      setFinalizedMeetings(resFinalized.data);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };




  const MeetingSchedule = async () => {
    let schedules = [];
    console.log("do we reach here?")
    for (let meeting of finalizedMeetings) {
      try {
        const response = await api.get(`/scheduler/meetings/${meeting.id}/finalized/`);
        const proposal = response.data.proposals[0];
        const startDateTime = new Date(`${meeting.date}T${proposal.start_time}`);
        const endDateTime = new Date(`${meeting.date}T${proposal.end_time}`);
        console.log("response", response.data.proposals[0])
        const calendardata = {
          id: meeting.id,
          title: meeting.name,
          start: startDateTime,
          end: endDateTime,
        };
        schedules.push(calendardata);
      } catch(error) {
        console.error("Error generating schedule for meeting", error);
      }
    }
    // console.log(schedules)
    setMeetingSchedule(schedules);
    setShowFinalizedSchedules(true);
  };















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






  // you need to get all finalized meetings of the owner of meeting meetindId

  return (
    <div>
      <h2>Set Your Meeting Preferences</h2>
      <form onSubmit={handleSubmit}>
        <div className="label-group">
          <label htmlFor="startTime">Start Time:</label>
          <div className="input-group">
            <input className="input" type="time" id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          </div>
        </div>
        <div className="label-group">
          <label htmlFor="endTime">End Time:</label>
          <div className="input-group">
            <input className="input" type="time" id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </div>
        </div>
        <div className="label-group">
          <label htmlFor="preferenceLevel">Preference Level:</label>
          <div className="input-group">
            <select className="input" id="preferenceLevel" value={preferenceLevel} onChange={(e) => setPreferenceLevel(e.target.value)}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <div className="label-group">
          <label htmlFor="status">Status:</label>
          <div className="input-group">
            <select className="input" id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
        <button type="submit">Submit Preferences</button>
      </form>
      { /* Read only Calendar */}
      <button onClick={MeetingSchedule}>show finalised Schedules</button>
      {
  showFinalizedSchedules && (
        <AppCalendar
          events={meetingSchedule.map(meeting_schedule => ({
            id: meeting_schedule.id,
            title: meeting_schedule.title,
            start: meeting_schedule.start,
            end: meeting_schedule.end,
                }))}
              />
            )
          }
    </div>

  );
};

export default SetPreference;

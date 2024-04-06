import React, { useEffect, useState } from 'react';
import api from '../../api';
import MeetingCard from "./Meetingcard.jsx";

const Schedule = () => {
  const [unfinalizedMeetings, setUnfinalizedMeetings] = useState([]);
  const [finalizedMeetings, setFinalizedMeetings] = useState([]);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const resUnfinalized = await api.get(`/scheduler/unfinalisedmeeting/`);
      const resFinalized = await api.get(`/scheduler/finalisedmeeting/`);
      setUnfinalizedMeetings(resUnfinalized.data);
      setFinalizedMeetings(resFinalized.data);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  return (
    <div>
      <div>
        <h2>Unfinalized Meetings</h2>
        {unfinalizedMeetings.map(meeting => (
          <MeetingCard key={meeting.id} meeting={meeting} />
        ))}
      </div>

      {/*<div>*/}
      {/*  <h2>Finalized Meetings</h2>*/}
      {/*  {finalizedMeetings.map(meeting => (*/}
      {/*    <MeetingCard key={meeting.id} meeting={meeting} />*/}
      {/*  ))}*/}
      {/*</div>*/}
    </div>
  );
};

export default Schedule;












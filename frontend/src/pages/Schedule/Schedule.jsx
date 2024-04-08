import React, { useEffect, useState } from 'react';
import api from '../../api';
import MeetingCard from "./Meetingcard.jsx";
// import ScheduleDisplay from "./ScheduleDisplay.jsx";
import Finishcard from "./Finishcard.jsx";
import AppCalendar from "../../components/AppCalendar.jsx";

const Schedule = () => {
  const [unfinalizedMeetings, setUnfinalizedMeetings] = useState([]);
  const [finalizedMeetings, setFinalizedMeetings] = useState([]);
  const [scheduleCombinations, setScheduleCombinations] = useState([]);
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(null);
  const [meetingSchedule, setMeetingSchedule] = useState([]);
  const [showFinalizedSchedules, setShowFinalizedSchedules] = useState(false);

  useEffect(() => {
    fetchMeetings();

  }, []);


  const handleScheduleButtonClick = (index) => {
    setSelectedScheduleIndex(selectedScheduleIndex === index ? null : index);
  };

  const renderScheduleButtons = () => {
    return scheduleCombinations.map((_, index) => (
      <button key={index} onClick={() => handleScheduleButtonClick(index)}>
        Schedule {index + 1}
      </button>
    ));
  };




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


  // handling suggested schedule
  const generateCombinations = async () => {
    let suggestedTimes = [];
    for (let meeting of unfinalizedMeetings) {
      try {
        const response = await api.post(`/scheduler/meetings/${meeting.id}/generate_schedule/`);
        const meetingSuggestedTtimes = {
          name: meeting.name,
          date: meeting.date,
          times: response.data.created_schedules
        };suggestedTimes.push(meetingSuggestedTtimes);
      } catch(error){
        console.error("Error generating schedule for meeting", error);
      }
    }
    let combinations = generateNonOverlappingSchedules(suggestedTimes)
    setScheduleCombinations(combinations)
  };




  function generateNonOverlappingSchedules(suggestedTimes) {
  const convertToDate = (baseDate, time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const dateParts = baseDate.split('-').map(Number);
    return new Date(dateParts[0], dateParts[1] - 1, dateParts[2], hours, minutes);
  };

  // Helper to check for time overlap
  const doTimesOverlap = (timeA, timeB) => {
    return timeA.date === timeB.date && !(timeA.end <= timeB.start || timeB.end <= timeA.start);
  };

  // Recursive function to generate all possible non-overlapping combinations
  const findCombinations = (current, remainingMeetings) => {
    if (!remainingMeetings.length || current.length >= 3) {
      return [current];
    }

    let combinations = [];
    const nextMeeting = remainingMeetings[0];
    const nextMeetings = remainingMeetings.slice(1);

    for (let time of nextMeeting.times) {
      const startTime = convertToDate(nextMeeting.date, time.start_time);
      const endTime = convertToDate(nextMeeting.date, time.end_time);
      const newTime = { id: time.id, start: startTime, end: endTime, date: nextMeeting.date, name: nextMeeting.name};


      // Check if the new time overlaps with any already selected times
      let overlaps = current.some(selectedTime => doTimesOverlap(selectedTime, newTime));

      if (!overlaps) {
        combinations = combinations.concat(findCombinations(current.concat(newTime), nextMeetings));
      }
    }
    // Also consider not including any time from this meeting
    combinations = combinations.concat(findCombinations(current, nextMeetings));
    return combinations;
  };

  // Start with an empty current schedule and all meetings as remaining to process
  let allCombinations = findCombinations([], suggestedTimes);

  // Filter out combinations that don't meet the criteria (e.g., having times from each meeting)
  allCombinations = allCombinations.filter(comb => comb.length === suggestedTimes.length);

  // Limit to up to four combinations
  return allCombinations.slice(0, 4);
}


  // console.log("new function works", scheduleCombinations);
  // console.log("new function works date", scheduleCombinations[0][0]['start']);
  //


  // meetingschedulefetching
   const MeetingSchedule = async () => {
    let schedules = [];
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
    console.log(schedules)
    setMeetingSchedule(schedules);
    setShowFinalizedSchedules(true);
  };





  return (
    <div>
      <div>
        <h2>Unfinalized Meetings</h2>
        {unfinalizedMeetings.map(meeting => (
          <MeetingCard
            key={meeting.id}
            meeting={meeting}
            onFinalize={fetchMeetings}
          />
        ))}
        <button onClick={generateCombinations}>Generate Schedule</button>
      </div>

      <div>
        <h2>Finalized Meetings</h2>
        {finalizedMeetings.map(meeting => (
          <Finishcard key={meeting.id} meeting={meeting} />
        ))}
      </div>

      {/*<div>Finalized Schedule</div>*/}
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




      <div>Schedule displayed below</div>
      {renderScheduleButtons()}
    {
      selectedScheduleIndex !== null && (
        <AppCalendar
          key={selectedScheduleIndex}
          events={scheduleCombinations[selectedScheduleIndex].map(meeting_schedule => ({
            id: meeting_schedule.id,
            title: meeting_schedule.name,
            start: meeting_schedule.start,
            end: meeting_schedule.end,
          }))}
        />
      )
    }
    <button onClick={MeetingSchedule}>show finalised Schedules</button>
    </div>
  );
};

export default Schedule;












import {useEffect, useState} from "react";
import api from "../../api.js";
import AddMeetingModal from "./AddMeetingModal.jsx";
import Meeting from "./Meeting.jsx";
import addMeetingModal from "./AddMeetingModal.jsx";
import './Calendar.css'
import {useAuth} from "../../providers/authProvider.jsx";

const Calendars = () => {
  const [name, setName] = useState("");
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState(null);
  const [displayPopup, setDisplayPopup] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const {logout} = useAuth();


  const [contacts, setContacts] = useState([]);


  const handleNameChange = (e) => {
    setName(e.target.value)
  }


  const fetchContacts = async () => {
    const response = await api.get("/contacts/list/");
    setContacts(response.data);
  }

  const fetchCalendars = async () => {
    try {
      const response = await api.get("/scheduler/calendars/");
      if (response.status === 401) {
        logout();
      }
      console.log(response.data);
      setCalendars(response.data.calendars);
    } catch(error) {
      console.log(error);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await api.post("/scheduler/calendars/", {
      name
    });
    await fetchCalendars();
  }


  useEffect(() => {
    fetchCalendars();
    fetchContacts()
  }, []);


  const showAddMeetingModal = (calendarId) => {
  setCurrentMeeting(null);
  setSelectedCalendarId(calendarId);
  setDisplayPopup(true);
};

  const handleMeetingEdit = (meeting) => {
  setCurrentMeeting(meeting);
  setSelectedCalendarId(meeting.calendar);
  setDisplayPopup(true);
};

  const handleMeetingDelete = async (meetingId) => {
  try {
    await api.delete(`scheduler/meetings/${meetingId}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access')}`,
      },
    });
    fetchCalendars();
  } catch (error) {
    console.error('Failed to delete meeting:', error);
  }
};


  const deleteCalendar = async (calendarId) => {
    try{
      await api.delete(`/scheduler/calendars/${calendarId}/`);

    setCalendars(calendars.filter(calendar => calendar.id !== calendarId));}
    catch{
      console.error('Failed to delete calendar:', calendars);
    }
  }



  const fetchMeetingsForCalendar = async (calendarId) => {
      try {
        const response = await api.get(`/scheduler/calendars/${calendarId}/initiate_meeting/`);
        setCalendars(currentCalendars =>
          currentCalendars.map(calendar =>
            calendar.id === calendarId ? { ...calendar, meetings: response.data.meetings } : calendar
          )
        );
        console.log("response data: ", response.data);
      } catch (error) {
        console.error('Error fetching meetings:', error);
      }
    };

  const onMeetingOperationComplete = async (calendarId) => {
    await fetchMeetingsForCalendar(calendarId);
    setDisplayPopup(false);
  };

  const handleCalendarSelect = async (calendarId) => {
    setSelectedCalendarId(calendarId);
    // await fetchMeetingsForCalendar(calendarId);
  };

  return (
    <div>
      {/* title */}
      <h2>Calendars</h2>
      {/*  form to add calendar   */}
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={handleNameChange}
          placeholder="Calendar Name"
        />
        <button type="submit">
          Add
        </button>
      </form>
      {/*  list all calendars of user */}
      {calendars.map(calendar => (
        <div className="calendar-card" key={calendar.id} onClick={() => handleCalendarSelect(calendar.id)}>
          <h3 >{calendar.name}</h3>
          <button type="button" onClick={() => showAddMeetingModal(calendar.id)}>
            Add Meeting
          </button>
          <button onClick={() => deleteCalendar(calendar.id)}> Delete</button>
          {/* Render meetings only if they exist */}
          {selectedCalendarId === calendar.id && Array.isArray(calendar.meetings) &&
            calendar.meetings.map(meeting => (
              <Meeting
                key={meeting.id}
                meeting={meeting}
                contacts={contacts}
                onEdit={() => handleMeetingEdit(meeting)}
                onDelete={() => handleMeetingDelete(meeting.id)}
              />
            ))
          }
        </div>
      ))}
      {displayPopup && (
        <AddMeetingModal
          show={displayPopup}
          onClose={() => setDisplayPopup(false)}
          onOperationComplete={onMeetingOperationComplete}
          calendarId={selectedCalendarId}
          currentMeeting={currentMeeting}
        />
      )}
    </div>
  );
};


export default Calendars;
